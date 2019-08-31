<?php

class JSON
{
    public static function getRequestData($subkey = false)
    {
        if (!$requestText = file_get_contents('php://input')) {
            return false;
        }

        $data = json_decode($requestText, true);

        return $subkey ? $data[$subkey] : $data;
    }

    public static function respond($data, $exit = true)
    {
        if (extension_loaded('newrelic')) {
            newrelic_disable_autorum();
        }

        if (
            (
                !empty($_GET['_profile'])
                || !empty($_COOKIE['_profile'])
                || !empty($_SERVER['HTTP_X_PROFILE'])
            )
            && !empty($GLOBALS['Session'])
            && $GLOBALS['Session']->hasAccountLevel('Developer')
        ) {
            $now = microtime(true);
            $siteDataPrefix = Site::$rootPath.'/'.SiteFile::$dataPath.'/';
            $siteDataPrefixLength = strlen($siteDataPrefix);

            $data['_profile'] = array(
                'log' => Debug::$log,
                'time' => array(
                    'initialized' => Site::$initializeTime,
                    'finished' => $now,
                    'elapsed' => $now - Site::$initializeTime
                ),
                'memory' => array(
                    'finished' => memory_get_usage(),
                    'peak' => memory_get_peak_usage()
                ),
                'included' => array_map(function ($path) use ($siteDataPrefix, $siteDataPrefixLength) {
                    if (substr($path, 0, $siteDataPrefixLength) == $siteDataPrefix) {
                        return 'site://'.SiteFile::getByID(substr($path, $siteDataPrefixLength))->FullPath;
                    }

                    return 'file://'.$path;
                }, get_included_files())
            );
        }

        $text = json_encode($data);

        if ($text === false) {
            throw new Exception('Failed to encode json data, json_last_error='.json_last_error());
        }

        header('Content-type: application/json; charset=utf-8');
        print($text);
        Site::finishRequest($exit);
    }

    public static function translateAndRespond($data, $summary = null, $include = null)
    {
        static::respond(static::translateObjects($data, $summary, $include));
    }


    public static function error($message, $statusCode = 200)
    {
        switch ($statusCode) {
            case 400:
                header('HTTP/1.0 400 Bad Request');
                break;
            case 401:
                header('HTTP/1.0 401 Unauthorized');
                break;
            case 403:
                header('HTTP/1.0 403 Forbidden');
                break;
            case 404:
                header('HTTP/1.0 404 Not Found');
                break;
            case 405:
                header('HTTP/1.0 405 Method Not Allowed');
                break;
            case 429:
                header('HTTP/1.1 429 Too Many Requests');
                break;
        }

        $args = func_get_args();

        self::respond(array(
            'success' => false
            ,'message' => vsprintf($message, array_slice($args, 1))
        ));
    }

    public static function translateObjects($input, $summary = null, $include = null, $stringsOnly = false)
    {
        if (is_object($input)) {
            if (
                !empty($include) &&
                $summary ? method_exists($input, 'getSummary') : method_exists($input, 'getDetails')
            ) {
                $includeThisLevel = array();
                $includeLater = array();

                if (!empty($include)) {
                    if (is_string($include)) {
                        $include = explode(',', $include);
                    }

                    foreach ($include AS $value) {
                        if ($value == '*') {
                            $includeThisLevel = '*';
                            continue;
                        }

                        if (strpos($value, '.') !== false) {
                            list($prefix, $rest) = explode('.', $value, 2);

                            if ($prefix == '*') {
                                $includeThisLevel = '*';
                            } elseif ($includeThisLevel != '*' &&!in_array($prefix, $includeThisLevel)) {
                                $includeThisLevel[] = $prefix;
                            }

                            $includeLater[$prefix][] = $rest;
                        } else {
                            if ($value[0] == '~') {
                                $includeLater['*'] = $value;
                                $value = substr($value, 1);
                            }

                            if ($includeThisLevel != '*') {
                                $includeThisLevel[] = $value;
                            }
                        }
                    }
                }

                $input = $summary ? $input->getSummary($includeThisLevel) : $input->getDetails($includeThisLevel, $stringsOnly);
            } elseif (method_exists($input, 'getData')) {
                $input = $input->getData();
            }
        }

        if (is_array($input)) {
            foreach ($input AS $key => &$item) {
                if (isset($includeLater)) {
                    $includeNext = array_key_exists('*', $includeLater) ? $includeLater['*'] : array();

                    if (array_key_exists($key, $includeLater)) {
                        $includeNext = array_merge($includeNext, $includeLater[$key]);
                    }
                } else {
                    $includeNext = $include;
                }

                $item = static::translateObjects($item, $summary, $includeNext);
            }

            return $input;
        } else {
            return $input;
        }
    }

#    public static function mapArrayToRecords($array)
#    {
#		return array_map(create_function('$value', 'return array($value);'), $array);
#	}
#
#	static public function indent($json)
#    {
#
#		$result	   = '';
#		$pos	   = 0;
#		$strLen	   = strlen($json);
#		$indentStr = "\t";
#		$newLine   = "\n";
#
#		for($i = 0; $i <= $strLen; $i++) {
#
#			// Grab the next character in the string
#			$char = substr($json, $i, 1);
#
#			// If this character is the end of an element,
#			// output a new line and indent the next line
#			if($char == '}' || $char == ']') {
#				$result .= $newLine;
#				$pos --;
#				for ($j=0; $j<$pos; $j++) {
#					$result .= $indentStr;
#				}
#			}
#
#			// Add the character to the result string
#			$result .= $char;
#
#			// If the last character was the beginning of an element,
#			// output a new line and indent the next line
#			if ($char == ',' || $char == '{' || $char == '[') {
#				$result .= $newLine;
#				if ($char == '{' || $char == '[') {
#					$pos ++;
#				}
#				for ($j = 0; $j < $pos; $j++) {
#					$result .= $indentStr;
#				}
#			}
#		}
#
#		return $result;
#	}
}