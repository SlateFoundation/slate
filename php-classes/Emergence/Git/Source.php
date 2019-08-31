<?php

namespace Emergence\Git;

use Site;
use SiteFile;
use Emergence_FS;

use Gitonomy\Git\Admin AS GitAdmin;
use Gitonomy\Git\Repository;
use Gitonomy\Git\Exception\ProcessException AS GitProcessException;
use Emergence\SSH\KeyPair;


class Source
{
    public static $defaultBranch = 'master';

    protected $id;
    protected $config;
    protected $repository;
    protected $trees;
    protected $deployKey;

    public static function getAll()
    {
        static $sources = null;

        if ($sources === null) {
            $sources = \Git::$repositories;

            // instantiate sources
            foreach ($sources AS $id => &$source) {
                if (is_array($source)) {
                    $source = new static($id, $source);
                }
            }
        }

        return $sources;
    }

    public static function getById($sourceId)
    {
        $sources = static::getAll();

        return isset($sources[$sourceId]) ? $sources[$sourceId] : null;
    }

    public static function getRepositoriesRootPath()
    {
        $path = Site::$rootPath . '/site-data/git';

        if (!is_dir($path)) {
            mkdir($path, 0770, true);
        }

        return $path;
    }


    public function __construct($id, $config = [])
    {
        $this->id = $id;
        $this->config = $config;
    }

    public function getId()
    {
        return $this->id;
    }

    public function getConfig($key = null)
    {
        if ($key) {
            return isset($this->config[$key]) ? $this->config[$key] : null;
        }

        return $this->config;
    }

    public function getStatus()
    {
        if (!$this->isInitialized()) {
            return 'uninitialized';
        }

        $workTreeStatus = $this->getWorkTreeStatus(['groupByStatus' => true]);

        if (!empty($workTreeStatus['unstaged'])) {
            return 'dirty';
        }

        if (!empty($workTreeStatus['staged'])) {
            return 'commit-staged';
        }

        $upstreamDiff = $this->getUpstreamDiff();

        if ($upstreamDiff['behind']) {
            return 'behind';
        }

        if ($upstreamDiff['ahead']) {
            return 'ahead';
        }

        // TODO: out-of-sync?

        return 'clean';
    }

    public function isInitialized()
    {
        return (bool)$this->getRepository();
    }

    public function getRepositoryPath()
    {
        return static::getRepositoriesRootPath() . '/' . $this->id;
    }

    public function getPrivateKeyPath()
    {
        return $this->getRepositoryPath() . '.key';
    }

    public function getPublicKeyPath()
    {
        return $this->getRepositoryPath() . '.pub';
    }

    public function getDraftCommitMessagePath()
    {
        return $this->getRepositoryPath() . '/.git/COMMIT_MSG';
    }

    public function getGitEnvironment()
    {
        $env = [
            'GIT_SSH' => $this->getSshWrapperPath()
        ];

        if (!empty($GLOBALS['Session']) && ($User = $GLOBALS['Session']->Person)) {
            $env['GIT_AUTHOR_NAME'] = $env['GIT_COMMITTER_NAME'] = $User->FullName;
            $env['GIT_AUTHOR_EMAIL'] = $env['GIT_COMMITTER_EMAIL'] = $User->Email;
        }

        return $env;
    }

    public function getRepository()
    {
        if (!isset($this->repository)) {
            $gitDir = $this->getRepositoryPath();

            if (is_dir($gitDir)) {
                $this->repository = new Repository($gitDir, [
                    'environment_variables' => $this->getGitEnvironment()
                ]);
            } else {
                $this->repository = false;
            }
        }

        return $this->repository;
    }

    public function getDeployKey()
    {
        if ($this->deployKey) {
            return $this->deployKey;
        }

        $privateKeyPath = $this->getPrivateKeyPath();
        $publicKeyPath = $this->getPublicKeyPath();

        if (is_readable($privateKeyPath) && is_readable($publicKeyPath)) {
            $this->deployKey = KeyPair::load($privateKeyPath, $publicKeyPath);
        }

        return $this->deployKey;
    }

    public function setDeployKey(KeyPair $keyPair)
    {
        $privateKeyPath = $this->getPrivateKeyPath();
        file_put_contents($privateKeyPath, $keyPair->getPrivateKey() . PHP_EOL);
        chmod($privateKeyPath, 0600);

        $publicKeyPath = $this->getPublicKeyPath();
        file_put_contents($publicKeyPath, $keyPair->getPublicKey() . PHP_EOL);
        chmod($publicKeyPath, 0600);

        $this->deployKey = $keyPair;
    }

    public function getSshWrapperPath($create = true)
    {
        if (!$privateKeyPath = $this->getPrivateKeyPath()) {
            return null;
        }

        $wrapperPath = $this->getRepositoryPath() . '.git.sh';

        if (!is_file($wrapperPath)) {
            file_put_contents(
                $wrapperPath,
                sprintf("#!/bin/bash\n\nssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i %s $1 $2\n", escapeshellarg($privateKeyPath))
            );
            chmod($wrapperPath, 0700);
        }

        return $wrapperPath;
    }

    public function getCloneUrl()
    {
        return (empty($_SERVER['HTTPS']) ? 'http' : 'https') . '://' . Site::getConfig('primary_hostname') . '/site-admin/sources/' . $this->getId() . '.git';
    }

    /**
     * Return active or configured remote URL
     */
    public function getRemoteUrl()
    {
        try {
            if ($repository = $this->getRepository()) {
                return trim($repository->run('config', ['--get', 'remote.origin.url']));
            }
        } catch (GitProcessException $e) {
            // fall through to returning configured remote
        }

        return $this->getConfig('remote');
    }

    public function getRemoteProtocol()
    {
        $remoteUrl = $this->getRemoteUrl();

        return strpos($remoteUrl, 'https://') === 0 || strpos($remoteUrl, 'http://') === 0 ? 'http' : 'ssh';
    }

    public function getTrees()
    {
        if (!$this->trees) {
            $this->trees = [];

            foreach ($this->getConfig('trees') AS $treeKey => $treeValue) {
                $this->trees[] = $this->getTreeOptions($treeKey, $treeValue);
            }
        }

        return $this->trees;
    }

    public function getCommitDescription()
    {
        if (!$repository = $this->getRepository()) {
            return null;
        }

        return trim($repository->run('describe', ['--tags', '--always']));
    }

    public function getRefs($root = null)
    {
        if (!$repository = $this->getRepository()) {
            return null;
        }

        $output = trim($repository->run('for-each-ref', ['--format=%(refname)', 'refs/'.$root]));
        $output = explode(PHP_EOL, $output);

        return $output;
    }

    public function getGroupedRefs($root = null, array $metaGroups = ['remotes'])
    {
        $refs = $this->getRefs($root);
        $groups = [];

        foreach ($refs as $ref) {
            $ref = explode('/', $ref);

            array_shift($ref); // throw out 'refs/'

            $groupName = array_shift($ref); // grab root group name

            // append next path component to group name for meta-groups
            if (in_array($groupName, $metaGroups)) {
                $groupName .= '/' . array_shift($ref);
            }

            $groups[$groupName][] = implode('/', $ref);
        }


        return $groups;
    }

    public function getWorkingBranch()
    {
        if (!$repository = $this->getRepository()) {
            return $this->getConfig('workingBranch') ?: static::$defaultBranch;
        }

        try {
            return trim($repository->run('symbolic-ref', ['HEAD', '--short']));
        } catch (GitProcessException $e) {
            return null;
        }
    }

    public function getUpstreamBranch()
    {
        if ($repository = $this->getRepository()) {
            try {
                $upstreamBranch = trim($repository->run('rev-parse', ['--abbrev-ref', '@{upstream}']));
            } catch (GitProcessException $e) {
                return null;
            }

            if (strpos($upstreamBranch, 'origin/') === 0) {
                $upstreamBranch = substr($upstreamBranch, 7);
            }
        }

        return $upstreamBranch ?: $this->getConfig('originBranch') ?: static::$defaultBranch;
    }

    public function initialize()
    {
        if ($this->getRepository()) {
            throw new \Exception('repository already initialized');
        }

        // get configured branches before beginning initialization -- they won't return consistent results mid-initialization
        $upstreamBranch = $this->getUpstreamBranch();
        $workingBranch = $this->getWorkingBranch();

        // create new repo
        $this->repository = GitAdmin::init($this->getRepositoryPath(), false, [
            'environment_variables' => $this->getGitEnvironment()
        ]);

        // add remote
        $this->getRepository()->run('remote', ['add', 'origin', $this->getRemoteUrl()]);

        // fetch upstream branch and checkout
        $this->getRepository()->run('fetch', ['origin', $upstreamBranch]);
        $this->getRepository()->run('checkout', ['-b', $workingBranch, "origin/$upstreamBranch"]);

        return true;
    }

    public function fetch()
    {
        return $this->getRepository()->run('fetch', ['origin', $this->getUpstreamBranch(), '--tags']);
    }

    public function checkout($ref, $branch = null)
    {
        if (!$repository = $this->getRepository()) {
            throw new \Exception('repository must be initialized first');
        }


        // determine ref / branch
        if (strpos($ref, 'heads/') === 0) {
            $branch = substr($ref, 6);
            $ref = null;
        } elseif (strpos($ref, 'remotes/') === 0) {
            list($remotes, $remote, $branch) = explode('/', $ref, 3);
        }


        // build and run git command
        $args = [];

        if ($branch) {
            if ($branch && $ref) {
                $args[] = '-b';
            }

            $args[] = $branch;
        }

        if ($ref) {
            $args[] = "refs/$ref";
        }

        $repository->run('checkout', $args);


        return $branch;
    }

    public function pull()
    {
        $output = trim($this->getRepository()->run('merge', ['--ff-only', '--no-stat', '@{upstream}']));
        $output = explode(PHP_EOL, $output);

        if ($output[0] == 'Already up-to-date.') {
            return false;
        }

        list ($status, $commits) = explode(' ', $output[0]);

        if ($status != 'Updating') {
            throw new \Exception('Unexpected merge status output: ' . $status);
        }

        list ($from, $to) = explode('..', $commits);

        return ['from' => $from, 'to' => $to];
    }

    public function push()
    {
        $output = trim($this->getRepository()->run('push', ['--porcelain', 'origin', 'HEAD']));
        $output = explode(PHP_EOL, $output);

        list ($symbol, $refs, $status) = explode("\t", $output[1]);

        if ($status == '[up to date]') {
            return false;
        }

        list ($from, $to) = explode('..', $status);

        return ['from' => $from, 'to' => $to];
    }

    public function getUpstreamDiff(array $options = [])
    {
        try {
            $this->fetch();
            $output = $this->getRepository()->run('rev-list', ['--left-right', "--format=%an\t%ae\t%at\t%s", 'HEAD...HEAD@{upstream}']);
        } catch (GitProcessException $e) {
            return ['error' => $e->getMessage()];
        }

        $output = explode(PHP_EOL, trim($output));

        $commits = [];
        $ahead = 0;
        $behind = 0;

        while (($header = array_shift($output)) && ($details = array_shift($output))) {
            // parse header
            list ($objectType, $hash) = explode(' ', $header);

            if ($objectType != 'commit') {
                throw new \Exception('unexpected object type in rev-list output: ' . $objectType);
            }

            $position = $hash[0] == '<' ? 'ahead' : 'behind';
            $hash = substr($hash, 1);
            ${$position}++;

            // parse details
            list ($authorName, $authorEmail, $timestamp, $subject) = explode("\t", $details);

            $commit = [
                'hash' => $hash,
                'position' => $position,
                'authorName' => $authorName,
                'authorEmail' => $authorEmail,
                'timestamp' => $timestamp,
                'subject' => $subject
            ];

            if (!empty($options['groupByPosition'])) {
                $commits[$position][] = $commit;
            } else {
                $commits[] = $commit;
            }
        }

        return [
            'commits' => $commits,
            'ahead' => $ahead,
            'behind' => $behind
        ];
    }

    public function getWorkTreeStatus(array $options = [])
    {
        $output = $this->getRepository()->run('status', ['--porcelain', '-uall', '--ignored']);
        $output = array_filter(explode(PHP_EOL, $output));

        $files = [];

        foreach ($output AS $line) {
            if ($line[0] == '#') {
                continue; // skip comment lines
            }

            if (!preg_match('/^(?<indexStatus>[ MADRCU?!])(?<workTreeStatus>[ MADRCU?!]) (?<path>.+?)( -> (?<renamePath>.+?))?$/', $line, $matches)) {
                throw new \Exception('Could not parse git status output line: ' . $line);
            }

            $file = [
                'path' => $matches['path'],
                'renamedPath' => $matches['renamePath'] ?: null,
                'indexStatus' => $matches['indexStatus'] == ' ' ? null : $matches['indexStatus'],
                'workTreeStatus' => $matches['workTreeStatus'] == ' ' ? null : $matches['workTreeStatus']
            ];

            // handle quoted paths
            if ($file['path'][0] == '"') {
                $file['path'] = stripslashes(substr($file['path'], 1, -1));
            }

            if ($file['renamedPath'] && $file['renamedPath'][0] == '"') {
                $file['renamedPath'] = stripslashes(substr($file['renamedPath'], 1, -1));
            }

            $file['currentPath'] = !empty($file['renamedPath']) ? $file['renamedPath'] : $file['path'];

            // decode status
            $file['tracked'] = $file['indexStatus'] != '?' && $file['workTreeStatus'] != '?';
            $file['ignored'] = $file['indexStatus'] == '!' && $file['workTreeStatus'] == '!';
            $file['staged'] = $file['tracked'] && !$file['ignored'] && (bool)$file['indexStatus'];
            $file['unstaged'] = !$file['ignored'] && (bool)$file['workTreeStatus'];

            if (!empty($options['groupByStatus'])) {
                if ($file['staged']) {
                    $files['staged'][$file['currentPath']] = $file;
                }

                if ($file['unstaged']) {
                    $files['unstaged'][$file['currentPath']] = $file;
                }

                if ($file['ignored']) {
                    $files['ignored'][$file['currentPath']] = $file;
                }
            } else {
                $files[$file['currentPath']] = $file;
            }

        }

        return $files;
    }

    public function syncFromVfs()
    {
        $results = [];
        $exportOptions = [
            'localOnly' => true
        ];

        if ($this->getConfig('localOnly') === false) {
            $exportOptions['localOnly'] = false;
        }

        chdir($this->getRepositoryPath());

        foreach ($this->getConfig('trees') AS $treeKey => $treeValue) {
            $treeOptions = array_merge(
                $exportOptions,
                static::getTreeOptions($treeKey, $treeValue),
                [
                    'dataPath' => false
                ]
            );

            $result = [];

            try {
                if ($srcFileNode = Site::resolvePath($treeOptions['vfsPath'])) {
                    if ($srcFileNode instanceof SiteFile) {
                        $destDir = dirname($treeOptions['gitPath']);

                        if ($destDir && !is_dir($destDir)) {
                            mkdir($destDir, 0777, true);
                        }

                        copy($srcFileNode->RealPath, $treeOptions['gitPath']);
                        $result = ['filesAnalyzed' => 1, 'filesWritten' => 1];
                    } else {
                        $result = Emergence_FS::exportTree($treeOptions['vfsPath'], $treeOptions['gitPath'], $treeOptions);
                    }

                    $result['success'] = true;
                } else {
                    $result['success'] = false;
                }
            } catch (Exception $e) {
                $result['success'] = false;
                $result['error'] = $e->getMessage();
            }

            $results[$treeOptions['vfsPath']] = $result;
        }

        // analyze mode changes
        $diff = $this->getRepository()->run('diff', ['--summary']);
        $diff = explode(PHP_EOL, $diff);

        foreach ($diff as $diffLine) {
            $diffLine = trim($diffLine);

            if (!preg_match('/^mode change (?<modeFrom>\d+) => (?<modeTo>\d+) (?<path>.+?)$/', $diffLine, $matches)) {
                continue;
            }

            if ($matches['modeFrom'] == '100755') {
                chmod($matches['path'], 0755);
            }
        }

        return $results;
    }

    public function syncToVfs()
    {
        $results = [];

        chdir($this->getRepositoryPath());

        foreach ($this->getConfig('trees') AS $treeKey => $treeValue) {
            $treeOptions = array_merge(
                static::getTreeOptions($treeKey, $treeValue),
                [
                    'dataPath' => false
                ]
            );

            $treeOptions['exclude'][] = '#(^|/)\\.git(/|$)#';

            $result = [];

            try {
                if (is_file($treeOptions['gitPath'])) {
                    $sha1 = sha1_file($treeOptions['gitPath']);
                    $existingNode = Site::resolvePath($treeOptions['vfsPath']);
                    $result['filesAnalyzed'] = 1;

                    if (!$existingNode || $existingNode->SHA1 != $sha1) {
                        $fileRecord = SiteFile::createFromPath($treeOptions['vfsPath'], null, $existingNode ? $existingNode->ID : null);
                        SiteFile::saveRecordData($fileRecord, fopen($treeOptions['gitPath'], 'r'), $sha1);
                        $result['filesUpdated'] = 1;
                    } else {
                        $result['filesUpdated'] = 0;
                    }
                } else {
                    $result = Emergence_FS::importTree($treeOptions['gitPath'], $treeOptions['vfsPath'], $treeOptions);
                }
                $result['success'] = true;
            } catch (Exception $e) {
                $result['success'] = false;
                $result['error'] = $e->getMessage();
            }

            $results[$treeOptions['vfsPath']] = $result;
        }

        return $results;
    }

    public function eraseFromVfs()
    {
        $results = [];

        foreach ($this->getConfig('trees') AS $treeKey => $treeValue) {
            $treeOptions = static::getTreeOptions($treeKey, $treeValue);

            $result = [];

            try {
                if ($srcFileNode = Site::resolvePath($treeOptions['vfsPath'])) {
                    if ($srcFileNode instanceof SiteFile) {
#                        \Debug::dumpVar($srcFileNode, false, "Found file at path: $treeOptions[vfsPath]");
                        $srcFileNode->delete();
                        $result = ['filesDeleted' => 1];
                    } else {
#                        \Debug::dumpVar($treeOptions, false, "Found tree at path: $treeOptions[vfsPath]");
                        $result = static::eraseTree($treeOptions['vfsPath'], $treeOptions);
                    }

                    $result['success'] = true;
                } else {
                    $result['success'] = false;
                }
            } catch (Exception $e) {
                $result['success'] = false;
                $result['error'] = $e->getMessage();
            }

            $results[$treeOptions['vfsPath']] = $result;
        }

        return $results;
    }

    public function stage(array $paths)
    {
        $this->getRepository()->run('add', array_merge(['--all'], $paths));
        return count($paths);
    }

    public function unstage(array $paths)
    {
        $this->getRepository()->run('reset', array_merge(['HEAD'], $paths));
        return count($paths);
    }

    public function getDraftCommitMessage()
    {
        $path = $this->getDraftCommitMessagePath();

        return file_exists($path) ? file_get_contents($path) : null;
    }

    public function setDraftCommitMessage($message)
    {
        file_put_contents($this->getDraftCommitMessagePath(), $message);
    }

    public function commit($message, $author = null)
    {
        $args = ['--quiet', '--message='.$message];

        if ($author) {
            $args[] = '--author='.$author;
        }

        $this->getRepository()->run('commit', $args);
        $this->setDraftCommitMessage('');

        return true;
    }

    public function getDiff(array $options = [])
    {
        // apply options
        if (empty($options['path'])) {
            $options['path'] = '.';
        } elseif (is_array($options['path'])) {
            $options['path'] = implode(' ', $options['path']);
        }

        if (empty($options['group'])) {
            $options['group'] = 'unstaged';
        } elseif ($options['group'] != 'staged' && $options['group'] != 'unstaged') {
            throw new \Exception('group must be staged or unstaged');
        }


        // build diff args
        $diffArgs = [];

        if ($options['group'] == 'staged') {
            $diffArgs[] = '--cached';
        }

        $diffArgs[] = '--';
        $diffArgs[] = $options['path'];

        // execute and return raw diff output
        return $this->getRepository()->run('diff', $diffArgs);
    }

    public function clean()
    {
        $this->getRepository()->run('reset', ['--hard']);
        $this->getRepository()->run('clean', ['-df']);
    }


    protected function getTreeOptions($key, $value)
    {
        if (is_string($value)) {
            $treeOptions = [
                'gitPath' => $value
            ];
        } else {
            $treeOptions = $value;
        }

        $treeOptions['dataPath'] = false;

        if (!isset($treeOptions['localOnly'])) {
            $treeOptions['localOnly'] = $this->getConfig('localOnly') === null ? true : $this->getConfig('localOnly');
        }

        if (is_string($key)) {
            $treeOptions['vfsPath'] = $key;
        }

        if (!$treeOptions['vfsPath']) {
            $treeOptions['vfsPath'] = $treeOptions['path'] ?: $treeOptions['gitPath'];
        }

        if (!$treeOptions['gitPath']) {
            $treeOptions['gitPath'] = $treeOptions['path'] ?: $treeOptions['vfsPath'];
        }

        $treeOptions['gitPath'] = ltrim($treeOptions['gitPath'], '/') ?: '.';

        unset($treeOptions['path']);

        if (is_string($treeOptions['exclude'])) {
            $treeOptions['exclude'] = array($treeOptions['exclude']);
        }

        if (!empty($_REQUEST['minId']) && ctype_digit($_REQUEST['minId'])) {
            $treeOptions['minId'] = $_REQUEST['minId'];
        }

        if (!empty($_REQUEST['maxId']) && ctype_digit($_REQUEST['maxId'])) {
            $treeOptions['maxId'] = $_REQUEST['maxId'];
        }

        return $treeOptions;
    }

    // TODO: merge into Emergence_FS
    protected static function eraseTree($path, array $options = [])
    {
        // initialize result accumulators
        $collectionsAnalyzed = [];
        $collectionsDeleted = [];
        $collectionsExcluded = 0;
        $collectionsNotEmptied = [];

        $filesAnalyzed = 0;
        $filesExcluded = 0;
        $filesDeleted = [];


        // prepare options
        $options = array_merge([
            'exclude' => [],
            'pretend' => false
        ], $options);


        if (!empty($options['exclude']) && is_string($options['exclude'])) {
            $options['exclude'] = [$options['exclude']];
        }

        // normalize input paths
        if (!$path || $path == '/' || $path == '.' || $path == './') {
            $path = null;
        } else {
            $path = trim($path, '/');
        }


        // build map of subtrees to be erased
        $prefixLen = strlen($path);
        $tree = Emergence_FS::getTree($path, true);

        foreach ($tree AS $collectionId => &$node) {

            if ($node['ParentID'] && $tree[$node['ParentID']]) {
                $node['_path'] = $tree[$node['ParentID']]['_path'] . '/' . $node['Handle'];
            } else {
                $node['_path'] = $path;
            }

            $relPath = substr($node['_path'], $prefixLen);

            if ($node['Status'] != 'Normal') {
                continue;
            }

            if (Emergence_FS::matchesExclude($relPath, $options['exclude'])) {
                $collectionsExcluded++;
                $collectionsNotEmptied[] = $collectionId;
                continue;
            }

            $collectionsAnalyzed[] = $collectionId;
        }


        // erase files
        if (count($collectionsAnalyzed)) {
            $conditions = [
                sprintf('CollectionID IN (%s)', join(',', $collectionsAnalyzed)),
                'Status != "Phantom"'
            ];

            $fileResult = \DB::query(
                '
                    SELECT f2.*
                      FROM (
                               SELECT MAX(f1.ID) AS ID
                                 FROM `%1$s` f1
                                WHERE (%2$s)
                                GROUP BY f1.CollectionID, f1.Handle
                           ) AS lastestFiles
                      LEFT JOIN `%1$s` f2 USING (ID)
                     WHERE Status = "Normal"
                ',
                [
                    SiteFile::$tableName,
                    implode(') AND (', $conditions)
                ]
            );

            // copy each
            while ($fileRow = $fileResult->fetch_assoc()) {
                $filesAnalyzed++;
                $fileCollection =& $tree[$fileRow['CollectionID']];
                $filePath = $fileCollection['_path'].'/'.$fileRow['Handle'];
                $relPath = substr($filePath, $prefixLen);

                if (Emergence_FS::matchesExclude($relPath, $options['exclude'])) {
                    $filesExcluded++;

                    if (!in_array($fileRow['CollectionID'], $collectionsNotEmptied)) {
                        $collectionsNotEmptied[] = $fileRow['CollectionID'];
                    }

                    continue;
                }

                \DB::nonQuery(
                    'INSERT INTO `%s` SET CollectionID = %u, Handle = "%s", Status = "Deleted", AuthorID = %u, AncestorID = %u',
                    [
                        \SiteFile::$tableName,
                        $fileRow['CollectionID'],
                        $fileRow['Handle'],
                        !empty($GLOBALS['Session']) ? $GLOBALS['Session']->PersonID : null,
                        $fileRow['ID'],
                    ]
                );
                \Cache::delete(\SiteFile::getCacheKey($fileRow['CollectionID'], $fileRow['Handle']));

                $filesDeleted[] = $filePath;
            }
        }


        // erase empty trees
        foreach (array_reverse($tree, true) AS $collectionId => $collection) {
            if (in_array($collectionId, $collectionsNotEmptied)) {
                if (!empty($collection['ParentID'])) {
                    $collectionsNotEmptied[] = $collection['ParentID'];
                }

                continue;
            }

            \DB::nonQuery(
                'UPDATE `%s` SET Status = "Deleted" WHERE ID = %u',
                [
                    \SiteCollection::$tableName,
                    $collectionId
                ]
            );
            \Cache::delete(\SiteCollection::getCacheKey($collection['Handle'], $collection['ParentID']));

            $collectionsDeleted[] = $collection['_path'];
        }


        return [
            'collectionsExcluded' => $collectionsExcluded,
            'collectionsAnalyzed' => count($collectionsAnalyzed),
            'collectionsNotEmptied' => count($collectionsNotEmptied),
            'collectionsDeleted' => $collectionsDeleted,
            'filesExcluded' => $filesExcluded,
            'filesAnalyzed' => $filesAnalyzed,
            'filesDeleted' => $filesDeleted
        ];
    }
}