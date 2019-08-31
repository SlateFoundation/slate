<?php

namespace Jarvus\Sencha;

class Util
{
    /**
     * Cleans out comments and encoding errors in Sencha CMD generated app.json
     * files so they can be parsed
     */
    public static function cleanJson($json)
    {
        $json = preg_replace('#(/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+/)|([\s\t]//.*)|(^//.*)#', '', $json); // comment stripper from http://php.net/manual/en/function.json-decode.php#112735
        $json = preg_replace('#([^\\\\])\\\\\\.#', '$1\\\\\\.', $json); // replace sencha-included "\." with "\\."

        return $json;
    }

    public static function loadAntProperties($file)
    {
        $properties = [];

        $fp = is_resource($file) ? $file : fopen($file, 'r');

        while ($line = fgetss($fp)) {
            // clean out space and comments
            $line = preg_replace('/\s*([^#\n\r]*)\s*(#.*)?/', '$1', $line);

            if ($line) {
                list($key, $value) = explode('=', $line, 2);
                $properties[$key] = $value;
            }
        }

        fclose($fp);

        return $properties;
    }

    public static function patchAntProperties($file, $properties)
    {
        $inputFile = fopen($file, 'r');
        $outputFile = fopen("$file.tmp", 'w');

        // transfer existing properties, replacing matching ones with new value
        while ($line = fgetss($inputFile)) {
            foreach ($properties AS $key => $value) {
                if (strpos(ltrim($line), $key) === 0) {
                    fwrite($outputFile, "#$line$key=$value\n");
                    unset($properties[$key]);
                    continue 2;
                }
            }

            fwrite($outputFile, $line);
        }

        fclose($inputFile);

        // append remaining properties to end of file
        if (count($properties)) {
            fwrite($outputFile, "\n\n");
            foreach ($properties AS $key => $value) {
                fwrite($outputFile, "$key=$value\n");
            }
        }

        fclose($outputFile);

        rename("$file.tmp", $file);
    }
}