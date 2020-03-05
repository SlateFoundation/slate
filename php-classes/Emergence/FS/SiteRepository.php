<?php

namespace Emergence\FS;

use DB;
use Emergence\Git\File;
use Emergence\Git\Repository;
use Emergence\Git\Tree;
use Site;
use SiteFile;
use User;

class SiteRepository extends Repository
{
    public static $anonymousName = 'system';
    public static $anonymousEmail;
    public static $chunkCommitThreshold = 3600; // 1 hour

    /**
     * Get git-friendly author/committer information for given user ID.
     */
    protected static $peopleCache = [];

    /**
     * Get information about a given VFS collection.
     */
    protected static $collectionsCache = [];

    /**
     * Return full path to git command.
     */
    protected static $gitCommandPath;

    public function __construct()
    {
        $gitDir = Site::$rootPath.'/site-data/site.git';

        if (!is_dir($gitDir)) {
            exec("git init --bare $gitDir");
        }

        parent::__construct($gitDir);
    }

    public static function __classLoaded()
    {
        // copy config from legacy class if not defined locally
        if (!static::$anonymousEmail && static::$anonymousName) {
            static::$anonymousEmail = static::$anonymousName.'@'.Site::getConfig('primary_hostname');
        }
    }

    /**
     * Synchronize git repository with VFS.
     */
    public function synchronize()
    {
        // find VFS tip: the last commit on master containing emergence-vfs-index
        $refs = $this->getReferences();
        $masterCommit = null;
        $masterIndex = 0;

        if ($refs->hasBranch('master')) {
            $masterBranch = $refs->getBranch('master');

            $parentSearchOutput = $this->run('log', ['--pretty=format:%H%n%b', '--grep=^emergence-vfs-index: ', '-n 1', 'master']);
            $parentSearchOutput = array_filter(explode(PHP_EOL, $parentSearchOutput));

            if (count($parentSearchOutput)) {
                $masterCommit = array_shift($parentSearchOutput);

                foreach ($parentSearchOutput as $line) {
                    if (preg_match('/^emergence-vfs-index: (?<index>\d+)$/', $line, $matches)) {
                        $masterIndex = $matches['index'];

                        break;
                    }
                }
            }

            // TODO: implement two-way reconciliation
            if ($masterBranch->getCommitHash() != $masterCommit) {
                throw new \Exception("vfs tip ($masterCommit) is not the tip of master");
            }
        }

        // load trees and layers
        $masterTree = new Tree($this, $masterCommit);

        $layerTrees = $layerCommits = $layerOrders = [
            'local' => null,
            'parent' => null,
        ];

        $i = 0;
        foreach ($layerOrders as &$order) {
            $order = $i++;
        }

        foreach ($layerTrees as $layerName => $layerTree) {
            if ($masterCommit && $refs->hasBranch($layerName)) {
                $layerCommit = trim($this->run('merge-base', [$masterCommit, $layerName])) ?: null;
            } else {
                $layerCommit = null;
            }

            $layerTrees[$layerName] = new Tree($this, $layerCommit);
            $layerCommits[$layerName] = $layerCommit;
        }

        // scan through writes in VFS since vfsTip/vfsIndex and build commits
        $result = DB::query('SELECT * FROM _e_files WHERE ID > %u ORDER BY ID', [$masterIndex]);
        $commit = null;

        while (($row = $result->fetch_assoc()) || $commit) {
            // parse date of write
            $date = $row ? strtotime($row['Timestamp']) : null;
            $collectionInfo = static::getCollectionInfo($row['CollectionID']);

            // flush commit if we're out of rows or the next row breaks chunking conditions
            if (
                $commit &&
                (
                    !$row ||
                    ($row['AuthorID'] != $commit['author']) ||
                    ($date - $commit['date'] > static::$chunkCommitThreshold) ||
                    ($collectionInfo['layer'] != $commit['layer'])
                )
            ) {
                $layerTree = $layerTrees[$commit['layer']];
                $layerCommit = $layerCommits[$commit['layer']];
                $layerOrder = $layerOrders[$commit['layer']];

                // get author
                $authorInfo = static::getPersonInfo($commit['author']);

                // write changes to master and layer trees
                foreach ($commit['changes'] as $changePath => $changeId) {
                    // skip change if a higher-priority layer has content
                    foreach ($layerOrders as $otherLayerName => $otherLayerOrder) {
                        if (
                            ($otherLayerOrder < $layerOrder) &&
                            ($layerTrees[$otherLayerName]->hasPath($changePath))
                        ) {
                            continue 2;
                        }
                    }

                    if ($changeId) {
                        $content = File::fromFilesystemPath($this, SiteFile::getRealPathByID($changeId));

                        $layerTree->setPath($changePath, $content);
                        $masterTree->setPath($changePath, $content);
                    } else {
                        $layerTree->deletePath($changePath);
                        $masterTree->deletePath($changePath);
                    }
                }

                // build commit message
                $message = sprintf(
                    "Update %u files\n\nemergence-vfs-index: %u\n",
                    count($commit['changes']),
                    $commit['index']
                );

                // initialize layer commit
                if (!$layerCommit) {
                    $layerCommit = $this->writeCommit(Tree::EMPTY_TREE_HASH, [
                        'author' => $authorInfo,
                        'date' => $commit['date'],
                        'message' => "Initialize layer {$commit['layer']}",
                    ]);
                }

                // write new commit for layer
                $layerTree->write();
                $layerCommit = $this->writeCommit($layerTree->getHash(), [
                    'branch' => $commit['layer'],
                    'parent' => $layerCommit,
                    'author' => $authorInfo,
                    'date' => $commit['date'],
                    'message' => $message,
                ]);

                $layerCommits[$commit['layer']] = $layerCommit;

                // initialize master commit
                if (!$masterCommit) {
                    $masterCommit = $this->writeCommit(Tree::EMPTY_TREE_HASH, [
                        'author' => $authorInfo,
                        'date' => $commit['date'],
                        'message' => 'Initialize composite',
                    ]);
                }

                // write new commit for master
                $masterTree->write();
                $masterCommit = $this->writeCommit($masterTree->getHash(), [
                    'branch' => 'master',
                    'parent' => [$masterCommit, $layerCommit],
                    'author' => $authorInfo,
                    'date' => $commit['date'],
                    'message' => $message,
                ]);

                $masterIndex = $commit['index'];

                // dequeue commit
                $commit = null;

                // break out of loop now if this was the last iteration to flush the last commit
                if (!$row) {
                    break;
                }
            }

            // start a new commit if needed
            if (!$commit) {
                $commit = [
                    'author' => $row['AuthorID'],
                    'layer' => $collectionInfo['layer'],
                    'changes' => [],
                ];
            }

            // get directory
            $path = $collectionInfo['path'].'/'.$row['Handle'];

            // update commit
            $commit['changes'][$path] = 'Normal' == $row['Status'] ? intval($row['ID']) : null;
            $commit['date'] = $date;
            $commit['index'] = intval($row['ID']);
        }
    }

    protected static function getPersonInfo($personID = null)
    {
        if (!$personID) {
            $Person = null;
        } elseif (array_key_exists($personID, static::$peopleCache)) {
            $Person = static::$peopleCache[$personID];
        } else {
            if (!$Person = User::getByID($personID)) {
                throw new \Exception("person not found: $personID");
            }

            static::$peopleCache[$personID] = $Person;
        }

        return [
            'name' => $Person ? $Person->FullName : static::$anonymousName,
            'email' => $Person && $Person->Email ? $Person->Email : static::$anonymousEmail,
        ];
    }

    protected static function getCollectionInfo($collectionID)
    {
        if (array_key_exists($collectionID, static::$collectionsCache)) {
            return static::$collectionsCache[$collectionID];
        }

        return static::$collectionsCache[$collectionID] = DB::oneRecord(
            'SELECT GROUP_CONCAT(parent.Handle ORDER BY parent.PosLeft SEPARATOR "/") AS path,'.
            '       IF(collection.Site = "Local", "local", "parent") AS layer'.
            '  FROM _e_file_collections collection'.
            '  JOIN _e_file_collections parent ON (collection.PosLeft BETWEEN parent.PosLeft AND parent.PosRight)'.
            ' WHERE collection.ID = %u',
            [
                $collectionID,
            ]
        );
    }

    protected static function getGitCommandPath()
    {
        if (!static::$gitCommandPath) {
            static::$gitCommandPath = exec('which git');
        }

        return static::$gitCommandPath;
    }

    /**
     * Write a commit
     * TODO:
     * - Move somewhere else.
     */
    protected function writeCommit($treeSha, array $options = [])
    {
        // build environment vars for commit
        $env = [];

        if (!empty($options['date'])) {
            $env['GIT_AUTHOR_DATE'] = $env['GIT_COMMITTER_DATE'] = $options['date'].date(' O');
        }

        if (!empty($options['author'])) {
            $env['GIT_AUTHOR_NAME'] = $env['GIT_COMMITTER_NAME'] = $options['author']['name'];
            $env['GIT_AUTHOR_EMAIL'] = $env['GIT_COMMITTER_EMAIL'] = $options['author']['email'];
        }

        // prepare command
        $command = static::getGitCommandPath();
        $command .= " commit-tree $treeSha";

        if (!empty($options['parent'])) {
            if (!is_array($options['parent'])) {
                $options['parent'] = [$options['parent']];
            }

            foreach ($options['parent'] as $parent) {
                $command .= " -p $parent";
            }
        }

        // open process
        $pipes = [];
        $process = proc_open(
            $command,
            [
                0 => ['pipe', 'rb'], // STDIN
                1 => ['pipe', 'wb'], // STDOUT
                2 => ['pipe', 'w'],  // STDERR
            ],
            $pipes,
            $this->getGitDir(),
            $env
        );
        list($STDIN, $STDOUT, $STDERR) = $pipes;

        // write commit message
        if (!empty($options['message'])) {
            if (is_string($options['message'])) {
                fwrite($STDIN, $options['message']);
            } elseif (is_callable($options['message'])) {
                call_user_func($options['message'], $STDIN);
            }
        }

        fclose($STDIN);

        // capture commit sha from output
        $commitSha = trim(stream_get_contents($STDOUT));
        fclose($STDOUT);

        // capture any error output
        stream_set_blocking($STDERR, false); // we don't want to wait for errors, just see if there are any ready to read
        $error = stream_get_contents($STDERR);
        fclose($STDERR);

        // clean up
        $exitCode = proc_close($process);

        // check for and report any error
        if ($exitCode || $error) {
            throw new \Exception("git exited with code $exitCode: $error");
        }

        // bump master to new commit
        if (!empty($options['branch'])) {
            $this->run('branch', ['-f', $options['branch'], $commitSha]);
        }

        return $commitSha;
    }
}
