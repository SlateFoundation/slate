<?php

namespace Emergence\Git;

use Site;
use User;
use Sabre\HTTP\BasicAuth;
use Gitonomy\Git\Repository;


class HttpBackend extends \RequestHandler
{
    /**
     * Require and cache developer authentication in a git-friendly way
     */
    protected static $authenticatedUser;

    public static function requireAuthentication()
    {
        if (static::$authenticatedUser) {
            return static::$authenticatedUser;
        }

        // authenticate developer
        if ($GLOBALS['Session']->hasAccountLevel('Developer')) {
            static::$authenticatedUser = $GLOBALS['Session']->Person;
        } else {
            $authEngine = new BasicAuth();
            $authEngine->setRealm('Develop '.Site::$title);
            $authUserPass = $authEngine->getUserPass();

            // try to get user
            $userClass = User::$defaultClass;
            static::$authenticatedUser = $userClass::getByLogin($authUserPass[0], $authUserPass[1]);

            // send auth request if login is inadiquate
            if (!static::$authenticatedUser || !static::$authenticatedUser->hasAccountLevel('Developer')) {
                $authEngine->requireLogin();
                die("You must login using a ".Site::getConfig('primary_hostname')." account with Developer access\n");
            }
        }

        return static::$authenticatedUser;
    }


    /**
     * Default route synchronizes and serves up primary site repository
     */
    public static function handleRequest()
    {
        static::requireAuthentication();


        set_time_limit(0);


        // get site repository and synchronize
        $repo = new SiteRepository();
        $repo->synchronize();


        // continue with generic repository request
        return static::handleRepositoryRequest($repo);
    }


    /**
     * Handle a git HTTP backend request for given repository
     *
     * ## TODO
     * - fire events
     */
    public static function handleRepositoryRequest(Repository $repo)
    {
        static::requireAuthentication();


        set_time_limit(0);


        // create git-http-backend process
        $pipes = [];
        $process = proc_open(
            exec('which git') . ' http-backend',
            [
            	0 => ['pipe', 'rb'], // STDIN
        		1 => ['pipe', 'wb'], // STDOUT
        		2 => ['pipe', 'w']  // STDERR
            ],
            $pipes,
            null,
            [
                'GIT_HTTP_EXPORT_ALL' => 1,

                'GIT_PROJECT_ROOT' => $repo->getGitDir(),
                'PATH_INFO' => '/' . implode('/', static::getPath()),

                'CONTENT_TYPE' => $_SERVER['CONTENT_TYPE'],
                'QUERY_STRING' => $_SERVER['QUERY_STRING'],
                'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
                'HTTP_ACCEPT' => $_SERVER['HTTP_ACCEPT'],
                'REMOTE_USER' => static::$authenticatedUser->Username,
                'REMOTE_ADDR' => Site::getConfig('primary_hostname')
            ]
        );


        // copy POST body to STDIN
        $inputStream = fopen('php://input', 'rb');
        stream_copy_to_stream($inputStream, $pipes[0]);
        fclose($inputStream);
        fclose($pipes[0]);


        // check for error on STDERR and turn into exception
        stream_set_blocking($pipes[2], false);
        $error = stream_get_contents($pipes[2]);
        fclose($pipes[2]);

        if ($error) {
            $exitCode = proc_close($process);
            throw new \Exception("git exited with code $exitCode: $error");
        }


        // read and set headers first
        $headers = [];
        while ($header = trim(fgets($pipes[1]))) {
            header($header, true);
        }


        // pass remaining output through to client
        fpassthru($pipes[1]);
        fclose($pipes[1]);


        // clean up
        proc_close($process);
        exit();
    }
}