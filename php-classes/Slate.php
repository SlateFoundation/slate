<?php

class Slate
{
    public static $schoolName;
    public static $schoolAbbr;
    public static $siteSlogan = 'Open source for education';
    public static $userEmailDomain;
    public static $generateUserEmail;
    public static $webTools = array();
    public static $manageTools = array(
        'People'     => '/manage#people',
        'Course Sections'    => '/manage#course-sections',
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

        if ($widgetConfig !== null && (!array_key_exists('enabled', $widgetConfig) || $widgetConfig['enabled'] !== false)) {
            $widgetConfig['enabled'] = true;
        }

        return $widgetConfig;
    }
    
    public static function generateUserEmail(Emergence\People\User $User)
    {
        if (is_callable(static::$generateUserEmail)) { 
            return call_user_func(static::$generateUserEmail, $User, static::$userEmailDomain); 
        } elseif (static::$userEmailDomain && $User->Username) {
            return $User->Username . '@' . static::$userEmailDomain; 
        }  else { 
            return null; 
        }
    }
}