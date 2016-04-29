<?php

namespace Slate\Assets;

use DB;
use NestingBehavior, HandleBehavior;
use TableNotFoundException;

class Status extends \VersionedRecord
{
    //VersionedRecord configuration
    public static $historyTable = 'history_asset_statuses';
    // ActiveRecord configuration
    public static $tableName = 'asset_statuses';
    public static $singularNoun = 'asset status';
    public static $pluralNoun = 'asset statuses';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'Status' => [
            'type' => 'enum',
            'values' => ['Active','Disabled'],
            'default' => 'Active'
        ]
    ];

    public static $relationships = [
        'Parent' => [
            'class' => __CLASS__,
            'type' => 'one-one'
        ],
        'Children' => [
            'class' => __CLASS__,
            'type' => 'one-many',
            'foreign' => 'ParentID'
        ]
    ];

    public static $dynamicFields = [
        'assetsCount' => [
            'getter' => 'getAssetsCount'
        ]
    ];

    public static $validators = [
        'Title' => [
            'errorMessage' => 'A title is required'
        ]
    ];

    public function getAssetsCount()
    {
        try {
            $statusIds = array_merge(DB::allValues('ID', 'SELECT ID FROM `%s` stat WHERE stat.Left BETWEEN %u AND %u', [
                static::$tableName,
                $this->Left,
                $this->Right
            ]), [$this->ID]);
        } catch (TableNotFoundException $e) {
            $statusIds = [];
        }

        try {
            $count = DB::oneValue('SELECT count(*) AS assetCount FROM `%s` WHERE StatusID IN ("%s")', [Asset::$tableName, join($statusIds, '", "')]);
        } catch (TableNotFoundException $e) {
            $count = 0;
        }

        return $count;
    }

    public static function getOrCreateByHandle($handle, $title = null)
    {
        if ($Status = static::getByHandle($handle)) {
            return $Status;
        } else {
            return static::create([
                'Title' => $title ? $title : $handle
                ,'Handle' => $handle
            ], true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);
        // save results
        return $this->finishValidation();
    }

    public function destroy()
    {
        parent::destroy();
        NestingBehavior::onDestroy($this);
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);
        NestingBehavior::onSave($this);
        // call parent
        parent::save($deep);
    }
}