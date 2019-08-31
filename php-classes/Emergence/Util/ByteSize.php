<?php

namespace Emergence\Util;


class ByteSize
{
    public static $suffixes = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

    /**
     * Adapted from http://stackoverflow.com/questions/2510434/format-bytes-to-kilobytes-megabytes-gigabytes
     */
    public static function format($bytes, array $options = [])
    {
        if (!isset($options['precision'])) {
            $options['precision'] = 2;
        }

        $bytes = max($bytes, 0); 
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
        $pow = min($pow, count(static::$suffixes) - 1); 

        $bytes /= pow(1024, $pow);

        return round($bytes, $options['precision']) . ' ' . static::$suffixes[$pow];
    }
}