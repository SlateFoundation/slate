<?php

namespace Emergence\Console;

use Colors\Color;
use Emergence\Logger as EmergenceLogger;

class Logger extends \Psr\Log\AbstractLogger
{
    public static $theme = [
        'debug' => 'dark',
        'info' => 'default',
        'notice' => ['default', 'bold'],
        'warning' => 'yellow',
        'error' => 'red',
        'critical' => ['red', 'bold'],
        'alert' => ['white', 'bg_red'],
        'emergency' => ['white', 'bg_red', 'bold']
    ];

    public function log($level, $message, array $context = [])
    {
        static $c = null;

        if ($c === null) {
            $c = new Color;
            $c->setTheme(static::$theme);
            $c->setForceStyle(true);
        }

        $message = EmergenceLogger::interpolate($message, $context);
        $message = str_replace(PHP_EOL, '⏎', $message);

        echo $c($level.': '.$message)->apply($level).PHP_EOL;
        flush();
    }
}
