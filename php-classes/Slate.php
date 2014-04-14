<?php

class Slate
{
    static public $schoolName;
    static public $schoolAbbr;
    static public $siteSlogan = 'Open-source for education';
    static public $webTools = array();
    static public $manageTools = array(
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

    static public $siteWidgets = array(
        'calendar' => true
    );

    static public function getWidgetConfig($id)
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