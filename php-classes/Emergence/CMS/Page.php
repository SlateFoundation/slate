<?php

namespace Emergence\CMS;

use ActiveRecord;


class Page extends AbstractContent
{
    // ActiveRecord configuration
    public static $defaultClass = __CLASS__;
    public static $singularNoun = 'page';
    public static $pluralNoun = 'pages';
    public static $collectionRoute = '/pages';

    public static $fields = array(
        'LayoutClass' => array(
            'type' => 'enum'
            ,'values' => array('OneColumn')
            ,'default' => 'OneColumn'
        )
        ,'LayoutConfig'  => 'json'
    );


    public static function getAllPublishedByContextObject(ActiveRecord $Context, $options = array())
    {
        $options = array_merge(array(
            'conditions' => array()
        ), $options);

        $options['conditions']['Class'] = __CLASS__;

        return parent::getAllPublishedByContextObject($Context, $options);
    }
}