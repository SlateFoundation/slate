<?php

namespace Emergence\OpenAPI;

use Symfony\Component\Yaml\Yaml;


class Writer
{
    public static $order = [
        'swagger',
        'info',
        'externalDocs',
        'host',
        'basePath',
        'schemes',
        'consumes',
        'produces',
        'securityDefinitions',
        'security',
        'tags',
        'parameters',
        'paths',
        'definitions',
        'responses'
    ];


    public static function sort(array $data)
    {
        uksort($data, function($a, $b) {
            $aPos = array_search($a, static::$order);
            $bPos = array_search($b, static::$order);

            if ($aPos === $bPos) {
                return 0;
            }

            return ($aPos !== false && ($aPos < $bPos || $bPos === false)) ? -1 : 1;
        });

        return $data;
    }

    public static function write(array $data)
    {
        return Yaml::dump(static::sort($data), 10, 2, Yaml::DUMP_EMPTY_ARRAY_AS_SEQUENCE);
    }
}