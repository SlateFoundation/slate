<?php

namespace Emergence\Util;

use Exception;
use SiteFile;
use Emergence_FS;
use Symfony\Component\Yaml\Yaml;


/**
 * TODO: use this in Sencha_App
 */
class Data
{
    public static function expandDottedKeysToTree($input, &$output = array())
    {
        foreach ($input AS $key => $value) {
            $keys = explode('.', $key);
            $target =& $output;

            while (count($keys) > 0) {
                $subKey = array_shift($keys);

                if (count($keys)) {
                    if (!array_key_exists($subKey, $target)) {
                        $target[$subKey] = array();
                    }

                    $target =& $target[$subKey];
                } else {
                    $target[$subKey] = $value;
                }
            }
        }

        return $output;
    }

    public static function collapseTreeToDottedKeys($input, &$output = array(), $prefix = null)
    {
        foreach ($input AS $key => $value) {
            $key = $prefix ? "$prefix.$key" : $key;
            if (is_array($value)) {
                static::collapseTreeToDottedKeys($value, $output, $key);
            } else {
                $output[$key] = $value;
            }
        }

        return $output;
    }

    /**
     * Return array containing all keys in either $from or $to set on array with keys 'from' and 'to'
     */
    public static function calculateDelta($from, $to)
    {
        throw new \Exception('Not implemented');
    }

    /**
     * return array of 'to' values from delta
     */
    public static function extractToFromDelta($delta, &$output = array())
    {
        foreach ($delta AS $key => $value) {
            if (!is_array($value)) {
                continue;
            }

            if (count($value) == 2 && array_key_exists('from', $value) && array_key_exists('to', $value)) {
                $output[$key] = $value['to'];
            } else {
                $output[$key] = static::extractToFromDelta($value);
            }
        }

        return $output;
    }

    public static function readNode(SiteFile $source)
    {
        if ($source->Type == 'application/json') {
            $parser = 'json';
        } elseif ($source->Type == 'application/x-yaml') {
            $parser = 'yaml';
        } elseif (!$extension = pathinfo($source->Handle, PATHINFO_EXTENSION)) {
            throw new Exception('Could not determine extension for node with unhandled MIME type');
        } elseif ($extension == 'json') {
            $parser = 'json';
        } elseif ($extension == 'yml' || $extension == 'yaml') {
            $parser = 'yaml';
        } else {
            throw new Exception('Unable to parse node, format unhandlable');
        }

        $contents = file_get_contents($source->RealPath);

        if ($parser == 'yaml') {
            return Yaml::parse($contents);
        }

        return json_decode($contents, true);
    }

    public static function parse($string)
    {
        return Yaml::parse($string);
    }

    public static function mergeFileTree($root, array $base = [])
    {
        Emergence_FS::cacheTree($root);
        $docsTree = Emergence_FS::findFiles('\.(ya?ml|json)$', true, $root);

        $data = $base;
        foreach ($docsTree AS $path => $node) {
            $pathStack = array_slice($node->getFullPath(null, false), 1);
            $dataRoot = &$data;

            while (count($pathStack) > 1) {
                $dataRoot = &$dataRoot[array_shift($pathStack)];
            }

            if ($pathStack[0][0] != '_') {
                $dataRoot = &$dataRoot[pathinfo($pathStack[0], PATHINFO_FILENAME)];
            }

            $nodeData = static::readNode($node);
            $dataRoot = $dataRoot ? array_replace_recursive($dataRoot, $nodeData) : $nodeData;
        }

        return $data;
    }
}