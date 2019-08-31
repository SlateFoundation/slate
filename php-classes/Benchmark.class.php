<?php

class Benchmark
{
    public static $livePrint = false;
    public static $startMark = null;
    public static $lastMark = null;
    public static $marks = array();

    public static function startLive()
    {
        header('X-Accel-Buffering: no');
        header('Content-Type: text/plain; charset=utf-8');
        ob_end_flush();

        static::$livePrint = true;
        static::mark('benchmark start');
    }

    public static function mark($label = 'mark')
    {
        $mark = microtime(true);
        static::$marks[$mark] = $label;

        if (!static::$startMark) {
            static::$lastMark = static::$startMark = $mark;
        }

        if (static::$livePrint) {
            printf("\n\t--%.2fs(%.2fs) - %s\n", $mark - static::$startMark, $mark - static::$lastMark, $label);
            ob_flush();
            flush();
        }

        static::$lastMark = $mark;
    }
}