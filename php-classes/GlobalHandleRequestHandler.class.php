<?php


class GlobalHandleRequestHandler extends RequestHandler
{
    public static function handleRequest($handle = false)
    {
        $pathStack = Site::$requestPath;

        if ($pathStack[0] == 'json') {
            static::$responseMode = array_shift($pathStack);
        }

        if (!$handle) {
            $handle = array_shift($pathStack);
        }


        // administrative actions
        if ($handle == '!autoreserve') {
            return static::handleAutoReserveRequest();
        }

        // route handle
        if ($GlobalHandle = GlobalHandle::getByHandle($handle)) {
            if (static::$responseMode == 'html') {
                if ($GlobalHandle->Type == 'Alias') {
                    Router::redirectViewRecord($GlobalHandle->Context, static::getPath());
                } else {
                    return static::throwNotFoundError();
                }
            } else {
                return static::respond('handle', array(
                    'success' => true
                    ,'data' => $GlobalHandle
                ));
            }
        } else {
            return static::throwNotFoundError();
        }
    }

    public static function handleAutoReserveRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Developer');
        static::$responseMode = 'json';

        $created = array();
        $failed = array();
        $verified = array();

        $dh = opendir('.');
        while (false !== ($file = readdir($dh))) {
            if (is_file($file) && preg_match('/^(.*)\.php$/i', $file, $matches)) {
                $handle = $matches[1];
                $Existing = GlobalHandle::getByHandle($handle);

                if (!$Existing) {
                    $created[] = GlobalHandle::create(array(
                        'Type' => 'Reserve'
                        ,'Handle' => $handle
                    ), true);
                } elseif ($Existing->Type != 'Reserve') {
                    $failed[] = $Existing;
                } else {
                    $verified[] = $Existing;
                }
            }
        }
        closedir($dh);

        return static::respond('autoreserve', array(
            'success' => true
            ,'created' => $created
            ,'failed' => $failed
            ,'verified' => $verified
        ));
    }
}