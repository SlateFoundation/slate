<?php

namespace SlateAdmin;


class WebApp extends \Emergence\WebApps\SenchaApp
{
    public static $plugins = [];


    public static function load($name = 'SlateAdmin')
    {
        return parent::load($name);
    }
}