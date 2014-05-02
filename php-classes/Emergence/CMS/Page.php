<?php

namespace Emergence\CMS;

class Page extends AbstractContent
{
    // ActiveRecord configuration
    static public $defaultClass = __CLASS__;
    static public $singularNoun = 'page';
    static public $pluralNoun = 'pages';
    static public $collectionRoute = '/pages';

    static public $fields = array(
        'LayoutClass' => array(
            'type' => 'enum'
            ,'values' => array('OneColumn')
            ,'default' => 'OneColumn'
        )
        ,'LayoutConfig'  => 'serialized'
    );


    static public function getAllPublishedByContextObject(ActiveRecord $Context, $options = array())
    {
        $options = array_merge(array(
            'conditions' => array()
        ), $options);

        $options['conditions']['Class'] = __CLASS__;

        return parent::getAllPublishedByContextObject($Context, $options);
    }
}