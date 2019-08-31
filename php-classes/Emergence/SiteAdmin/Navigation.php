<?php

namespace Emergence\SiteAdmin;

class Navigation
{
    public static $items = [];

    public static function getItems()
    {
        $items = array_filter(static::$items, function ($item) {
            return empty($item['requireAccountLevel']) || (!empty($GLOBALS['Session']) && $GLOBALS['Session']->hasAccountLevel($item['requireAccountLevel']));
        });

        // decorate array items with keys
        foreach ($items AS $key => &$value) {
            $value['key'] = $key;
        }

        // define reusable sorter
        $sorter = function ($item1, $item2) {
            $item1Before = empty($item1['before']) ? null : $item1['before'];
            $item1After = empty($item1['after']) ? null : $item1['after'];
            $item2Before = empty($item2['before']) ? null : $item2['before'];
            $item2After = empty($item2['after']) ? null : $item2['after'];

            if (
                $item1Before == 'all'
                || $item2After == 'all'
                || (is_string($item1Before) && $item1Before == $item2['key'])
                || (is_array($item1Before) && in_array($item2['key'], $item1Before))
                || (is_string($item2After) && $item2After == $item1['key'])
                || (is_array($item2After) && in_array($item1['key'], $item2After))
            ) {
                return -1;
            }

            if (
                $item2Before == 'all'
                || $item1After == 'all'
                || (is_string($item2Before) && $item2Before == $item1['key'])
                || (is_array($item2Before) && in_array($item1['key'], $item2Before))
                || (is_string($item1After) && $item1After == $item2['key'])
                || (is_array($item1After) && in_array($item2['key'], $item1After))
            ) {
                return 1;
            }

            return 0;
        };

        // run through sorter twice
        uasort($items, $sorter);
        uasort($items, $sorter);

        return $items;
    }
}