<?php

namespace Emergence\DAV;

use Emergence\WebApps\SenchaApp;
use Sabre\DAV\Mount\Plugin as MountPlugin;
use Sabre\DAV\Server;
use Sabre\DAV\TemporaryFileFilterPlugin;
use Site;
use User;
use UserSession;

class DevelopRequestHandler extends \Emergence\Site\RequestHandler
{
    public static $userClass = User::class;

    public static $userResponseModes = [
        'application/json' => 'json',
    ];

    public static function handleRequest()
    {
        if (extension_loaded('newrelic')) {
            newrelic_disable_autorum();
        }

        // retrieve authentication attempt
        if ($GLOBALS['Session']->hasAccountLevel('Developer')) {
            $User = $GLOBALS['Session']->Person;
        } else {
            $authEngine = new \Sabre\HTTP\BasicAuth();
            $authEngine->setRealm('Develop '.\Site::$title);
            $authUserPass = $authEngine->getUserPass();

            // try to get session
            if ('$session' == $authUserPass[0] || '_session' == $authUserPass[0]) {
                if ($Session = UserSession::getByHandle($authUserPass[1])) {
                    $User = $Session->Person;
                }
            } else {
                // try to get user
                $userClass = static::$userClass;
                $userClass = $userClass::getDefaultClass();
                $User = $userClass::getByLogin($authUserPass[0], $authUserPass[1]);
            }

            // send auth request if login is inadiquate
            if (!$User || !$User->hasAccountLevel('Developer')) {
                $authEngine->requireLogin();
                die('You must login using a '.Site::getConfig('primary_hostname').' account with Developer access');
            }
        }

        // store login to session
        if (isset($GLOBALS['Session'])) {
            $GLOBALS['Session'] = $GLOBALS['Session']->changeClass('UserSession', [
                'PersonID' => $User->ID,
            ]);
        }

        // detect base path
        $basePath = array_slice(Site::$requestPath, 0, count(Site::$resolvedPath));

        // switch to JSON response mode
        if ('json' == static::peekPath()) {
            $basePath[] = static::$responseMode = static::shiftPath();
        }

        // handle /develop request
        if ('GET' == $_SERVER['REQUEST_METHOD'] && 'html' == static::getResponseMode() && !static::peekPath()) {
            return static::sendResponse(SenchaApp::load('EmergenceEditor')->render());
        }

        // initial and configure SabreDAV
        $server = new Server(new RootCollection());
        $server->setBaseUri('/'.join('/', $basePath));

        // The lock manager is reponsible for making sure users don't overwrite each others changes. Change 'data' to a different
        // directory, if you're storing your data somewhere else.
//       $lockBackend = new Sabre_DAV_Locks_Backend_FS('/tmp/dav-lock');
//       $lockPlugin = new Sabre_DAV_Locks_Plugin($lockBackend);
//       $server->addPlugin($lockPlugin);

        // filter temporary files
        $server->addPlugin(new TemporaryFileFilterPlugin('/tmp/dav-tmp'));

        // ?mount support
        $server->addPlugin(new MountPlugin());

        // emergence :)
        $server->addPlugin(new ServerPlugin());

        // All we need to do now, is to fire up the server
        $server->exec();
    }
}
