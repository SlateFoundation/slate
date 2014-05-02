<?php

class Slate
{
    public static $schoolName;
    public static $schoolAbbr;
    public static $siteSlogan = 'Open-source for education';
    public static $webTools = array();
    public static $manageTools = array(
        'People'     => '/manage#people',
        'Courses'    => '/manage#courses/mycourses',
        'Pages'      => '/pages'
    );

    static function __classLoaded()
    {
        if (empty(static::$schoolName)) {
            static::$schoolName = Site::getConfig('label');
        }

        if (empty(static::$schoolAbbr)) {
            static::$schoolAbbr = preg_replace('/[^A-Z]/', '', static::$schoolName);
        }
    }

    public static $siteWidgets = array(
        'calendar' => true
    );

    public static function getWidgetConfig($id)
    {
        $widgetConfig = static::$siteWidgets[$id];

        if (!is_array($widgetConfig)) {
            $widgetConfig = $widgetConfig === true ? array() : null;
        }

        if ($widgetConfig !== null && $widgetConfig['enabled'] !== false) {
            $widgetConfig['enabled'] = true;
        }

        return $widgetConfig;
    }
}