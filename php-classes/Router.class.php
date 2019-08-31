<?php

/**
 * @deprecated
 * Tools for generating URLs to models, this is deprecated in favor of calling $Model->getURL() directly
 */
class Router
{
    public static $classPaths = array(
        'Person' => 'users'
        ,'Media' => 'media'
        ,'Event' => 'events'
        ,'Page' => 'pages'
        ,'CMS_Content' => 'content'
        ,'CMS_Page' => 'pages'
        ,'CMS_BlogPost' => 'blog'
        ,'CMS_Feature' => 'features'
    );

    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }

    public static function getClassPath($className)
    {
        if (is_object($className)) {
            $className = get_class($className);
        }

        if ($className::$collectionRoute) {
            return ltrim($className::$collectionRoute, '/');
        }

        if (!empty(static::$classPaths[$className])) {
            return static::$classPaths[$className];
        }

        foreach (class_parents($className) AS $parentName) {
            if (!empty(static::$classPaths[$parentName])) {
                return static::$classPaths[$parentName];
            }
        }

        return false;
    }

    public static function redirectViewRecord(ActiveRecord $Record, $path = array(), $permanent = false)
    {
        if (is_array($path)) {
            $path = implode('/', $path);
        }

        if (!$url = $Record->getURL()) {
            if (!$classPath = static::getClassPath($Record)) {
                return RequestHandler::throwError('No route to record viewer');
            }

            $url = '/'.$classPath.'/'.$Record->getHandle();
        }

        if ($path) {
            $url .= '/'.ltrim($path, '/');
        }

        if ($permanent) {
            Site::redirectPermanent($url);
        } else {
            Site::redirect($url);
        }
    }
}