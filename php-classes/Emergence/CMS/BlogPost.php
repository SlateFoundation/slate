<?php

namespace Emergence\CMS;

class BlogPost extends AbstractContent
{
    // ActiveRecord configuration
    public static $defaultClass = __CLASS__;
    public static $singularNoun = 'blog post';
    public static $pluralNoun = 'blog posts';
    public static $collectionRoute = '/blog';

    public static function getRecentlyPublished($limit = 5)
    {
        return static::getAllByWhere(array(
            'Class' => 'Emergence\CMS\BlogPost'
            ,'Status' => 'Published'
            ,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'
        ), array(
            'order' => array('Published' => 'DESC')
            ,'limit' => $limit
        ));
    }
}