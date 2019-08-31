<?php

namespace Emergence\SiteAdmin;

use Emergence\Git\Source;
use Emergence\SSH\KeyPair;
use Emergence\Git\HttpBackend AS GitHttpBackend;


class SourcesRequestHandler extends \RequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json'
    ];

    public static function handleRequest()
    {
        // git http backend handles its own authentication

        if ($sourceId = static::shiftPath()) {
            if (substr($sourceId, -4) == '.git') {
                if (!$source = Source::getById(substr($sourceId, 0, -4))) {
                    return static::throwNotFoundError('source not found');
                }

                return static::handleSourceGitRequest($source);
            }

            if (!$source = Source::getById($sourceId)) {
                return static::throwNotFoundError('source not found');
            }

            return static::handleSourceRequest(Source::getById($sourceId));
        }

        $GLOBALS['Session']->requireAccountLevel('Developer');

        return static::respond('sources', [
            'sources' => Source::getAll()
        ]);
    }

    public static function handleSourceGitRequest(Source $source)
    {
        return GitHttpBackend::handleRepositoryRequest($source->getRepository());
    }

    public static function handleSourceRequest(Source $source)
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');

        switch ($action = static::shiftPath()) {
            case 'initialize':
                return static::handleInitializeRequest($source);
            case 'deploy-key':
                return static::handleDeployKeyRequest($source);
            case 'pull':
                return static::handlePullRequest($source);
            case 'checkout':
                return static::handleCheckoutRequest($source);
            case 'push':
                return static::handlePushRequest($source);
            case 'sync-from-vfs':
                return static::handleSyncFromVfsRequest($source);
            case 'sync-to-vfs':
                return static::handleSyncToVfsRequest($source);
            case 'stage':
                return static::handleStageRequest($source);
            case 'unstage':
                return static::handleUnstageRequest($source);
            case 'commit':
                return static::handleCommitRequest($source);
            case 'diff':
                return static::handleDiffRequest($source);
            case 'clean':
                return static::handleCleanRequest($source);
            case 'erase':
                return static::handleEraseRequest($source);
            case '':
            case false:
                return static::respond('source', [
                    'source' => $source
                ]);
            default:
                return static::throwNotFoundError();
        }
    }

    public static function handleInitializeRequest(Source $source)
    {
        $deployKey = null;

        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (!empty($_POST['privateKey']) || !empty($_POST['publicKey'])) {
                if (empty($_POST['privateKey']) || empty($_POST['publicKey'])) {
                    return static::throwInvalidRequestError('Both public and private keys must be provided');
                }

                $deployKey = new KeyPair($_POST['privateKey'], $_POST['publicKey']);
                $source->setDeployKey($deployKey);
            }

            try {
                $source->initialize();
            } catch (\Exception $e) {
                return static::throwError('Failed to initialize repository: ' . $e->getMessage());
            }

            return static::respond('initialized', [
                'source' => $source
            ]);
        }

        return static::respond('initialize', [
            'source' => $source,
            'deployKey' => $source->getRemoteProtocol() == 'ssh' ? KeyPair::generate() : null
        ]);
    }

    public static function handleDeployKeyRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            if (empty($_POST['privateKey']) || empty($_POST['publicKey'])) {
                return static::throwInvalidRequestError('Both public and private keys must be provided');
            }

            $deployKey = new KeyPair($_POST['privateKey'], $_POST['publicKey']);
            $source->setDeployKey($deployKey);

            return static::respondStatusMessage($source, 'Deploy key saved');
        }

        if (!empty($_GET['source']) && $_GET['source'] == 'generated') {
            $deployKey = KeyPair::generate();
        } else {
            $deployKey = $source->getDeployKey();
        }

        return static::respond('deployKey', [
            'source' => $source,
            'deployKey' => $deployKey
        ]);
    }

    public static function handleCheckoutRequest(Source $source)
    {
        if (empty($_REQUEST['ref'])) {
            return static::throwInvalidRequestError('ref required');
        }

        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => "Are you sure you want to checkout ref \"$_REQUEST[ref]\"?"
            ]);
        }

        $branch = $source->checkout($_REQUEST['ref'], empty($_REQUEST['branch']) ? null : $_REQUEST['branch']);

        $destination = $branch ? "branch \"$branch\"" : 'detached HEAD';

        return static::respondStatusMessage($source, "Checkout out ref \"$_REQUEST[ref]\" to $destination");
    }

    public static function handlePullRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to pull all forward commits from the upstream branch?'
            ]);
        }

        $result = $source->pull();

        return static::respondStatusMessage($source, $result ? "Updated local branch from commit $result[from] to upstream commit $result[to]" : 'Local branch already up-to-date');
    }

    public static function handlePushRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to push all forward commits to the upstream branch?'
            ]);
        }

        $result = $source->push();

        return static::respondStatusMessage($source, $result ? "Updated remote branch from commit $result[from] to local commit $result[to]" : 'Remote branch already up-to-date');
    }

    public static function handleSyncFromVfsRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => "Are you sure you want to update the working tree on disk to the current state of the VFS?\n\nAny changes in the working tree that are not committed **may be lost permanently**!"
            ]);
        }

        return static::respond('syncedFromVfs', [
            'source' => $source,
            'results' => $source->syncFromVfs()
        ]);
    }

    public static function handleSyncToVfsRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to update the VFS from the current contents of the working tree?'
            ]);
        }

        return static::respond('syncedToVfs', [
            'source' => $source,
            'results' => $source->syncToVfs()
        ]);
    }

    public static function handleStageRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::throwInvalidRequestError('only POST accepted');
        }

        if (empty($_POST['paths'])) {
            return static::throwInvalidRequestError('no paths provided');
        }

        $result = $source->stage($_POST['paths']);

        return static::respondStatusMessage($source, "Staged $result change" . ($result == 1 ? '' : 's'));
    }

    public static function handleUnstageRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::throwInvalidRequestError('only POST accepted');
        }

        if (empty($_POST['paths'])) {
            return static::throwInvalidRequestError('no paths provided');
        }

        $result = $source->unstage($_POST['paths']);

        return static::respondStatusMessage($source, "Untaged $result change" . ($result == 1 ? '' : 's'));
    }

    public static function handleCommitRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::throwInvalidRequestError('only POST accepted');
        }

        $message = !empty($_POST['subject']) ? $_POST['subject'] : '';

        if (!empty($_POST['extended'])) {
            $message .= PHP_EOL . PHP_EOL . $_POST['extended'];
        }

        if (!empty($_REQUEST['action']) && $_REQUEST['action'] == 'save-draft') {
            $source->setDraftCommitMessage($message);
            return static::respondStatusMessage($source, 'Draft commit message saved');
        }

        if (empty($_POST['subject'])) {
            return static::throwInvalidRequestError('commit message required');
        }

        if (!empty($_POST['author'])) {
            $author = $_POST['author'];
        } elseif (!empty($GLOBALS['Session']) && ($User = $GLOBALS['Session']->Person)) {
            $author = "$User->FullName <$User->Email>";
        } else {
            $author = null;
        }

        $hash = $source->commit($message, $author);

        return static::respondStatusMessage($source, "Created commit");
    }

    public static function handleDiffRequest(Source $source)
    {
        $group = static::shiftPath();
        $path = implode('/', static::getPath()) ?: '.';

        try {
            $result = $source->getDiff([
                'group' => $group,
                'path' => $path
            ]);
            $error = false;
        } catch (\Exception $e) {
            $result = null;
            $error = $e->getMessage();
        }

        return static::respond('diff', [
            'source' => $source,
            'path' => $path,
            'group' => $group,
            'diff' => $result,
            'error' => $error
        ]);
    }

    public static function handleCleanRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to completely clean the git working tree back to the state of the last commit? Any changes made directly to the git working tree **may be lost permanently**!'
            ]);
        }

        $result = $source->clean();

        return static::respondStatusMessage($source, 'Cleaned git working tree');
    }

    public static function handleEraseRequest(Source $source)
    {
        if ($_SERVER['REQUEST_METHOD'] != 'POST') {
            return static::respond('confirm', [
                'question' => 'Are you sure you want to erase all mapped paths from the VFS?'
            ]);
        }

        $results = $source->eraseFromVfs();

        $collectionsDeleted = 0;
        $filesDeleted = 0;

        foreach ($results as $path => $result) {
            if (!empty($result['collectionsDeleted'])) {
                $collectionsDeleted += count($result['collectionsDeleted']);
            }

            if (!empty($result['filesDeleted'])) {
                $filesDeleted += is_array($result['filesDeleted']) ? count($result['filesDeleted']) : $result['filesDeleted'];
            }
        }

        return static::respondStatusMessage($source, "Erased $filesDeleted files and $collectionsDeleted collections from VFS");
    }


    protected static function respondStatusMessage(Source $source, $message)
    {
        return static::respond('message', [
            'message' => $message,
            'returnURL' => '/site-admin/sources/' . $source->getId(),
            'returnLabel' => 'Return to ' . $source->getId()
        ]);
    }
}