<?php

namespace Slate\Assets;

use NestingBehavior, HandleBehavior;
use DB;
use TableNotFoundException;

class Status extends \Emergence\Locations\Location
{
    // ActiveRecord configuration
    public static $tableName = 'asset_statuses';
    public static $singularNoun = 'asset status';
    public static $pluralNoun = 'asset statuses';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    public static $fields = array(
        'Status' => array(
            'type' => 'enum'
            ,'values' => array('Active','Disabled')
            ,'default' => 'Active'
        )
    );


    public static $relationships = array(
        'Parent' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
        ),
        'Children' => array(
            'type' => 'one-many',
            'class' => __CLASS__,
            'foreign' => 'ParentID'
        )
    );
    
    public static $dynamicFields = array(
        'assetsCount' => array(
            'getter' => 'getAssetsCount'    
        )
    );

    public static $validators = array(
#        'Title' => array(
#            'errorMessage' => 'A title is required'
#        )
    );
    
    public function getAssetsCount()
    {
        try {
            $statusIds = array_merge(\DB::allValues('ID', 'SELECT ID FROM `%s` stat WHERE stat.Left BETWEEN %u AND %u', array(
                static::$tableName,
                $this->Left,
                $this->Right
            )), array($this->ID));    
        } catch (TableNotFoundException $e) {
            $statusIds = [];
        }
        
        try {            
            $count = \DB::oneValue('SELECT count(*) AS assetCount FROM `%s` WHERE StatusID IN ("%s")', array(Asset::$tableName, join($statusIds, '", "') ) );
        } catch (TableNotFoundException $e) {
            $count = 0;
        }
        
        return $count;
    }
}