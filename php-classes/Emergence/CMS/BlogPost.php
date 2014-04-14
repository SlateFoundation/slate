<?php

namespace Emergence\CMS;

class BlogPost extends AbstractContent
{
    // ActiveRecord configuration
    static public $defaultClass = __CLASS__;
    static public $singularNoun = 'blog post';
    static public $pluralNoun = 'blog posts';

    static public function getRecentlyPublished($limit = 5)
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