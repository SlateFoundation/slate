<?php

namespace Slate\Assets;

use Slate\Assets\Asset;

class Ticket extends \ActivityRecord
{

    // ActiveRecord configuration
    public static $tableName = 'asset_tickets';
    public static $singularNoun = 'ticket';
    public static $pluralNoun = 'tickets';

    // Versioned Record config
    public static $historyTable = 'history_asset_tickets';

    // the lowest-level class in your table requires these lines,
    // they can be manipulated via config files to plug in same-table subclasses
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);
    public static $eventFields = array('Status', 'Type');
    
    public static $searchConditions = array(
        'Status' => array(
            'qualifiers' => array('any','status', 'tickets-status')
            ,'points' => 1
            ,'sql' => 'Status LIKE "%s"'
        )
        ,'Username' => array(
            'qualifiers' => array('username', 'name', 'assignee')
            ,'points' => 2
            ,'sql' => 'AssigneeID = (SELECT Person.ID FROM people Person WHERE Person.Username = "%s")'
        )
        ,'FirstName' => array(
            'qualifiers' => array('any', 'fname', 'name', 'assignee')
            ,'points' => 1
            ,'sql' => 'AssigneeID IN (SELECT Person.ID FROM people Person WHERE Person.FirstName LIKE "%%%s%%")'
        )
        ,'LastName' => array(
            'qualifiers' => array('any', 'lname', 'name', 'assignee')
            ,'points' => 1
            ,'sql' => 'AssigneeID IN (SELECT Person.ID FROM people Person WHERE Person.LastName LIKE "%%%s%%")'
        ),
        'FullName' => array(
            'qualifiers' => array('assignee'),
            'points' => 1,
            'sql' => 'AssigneeID IN (SELECT Person.ID FROM people Person WHERE CONCAT(Person.FirstName, " ", Person.LastName) LIKE "%%%s%%")'
        ),
        'Asset' => [
            'qualifiers' => ['assetid', 'asset'],
            'points' => 2,
            'sql' => 'AssetID = %u'
        ]
    );
    
    public static $fields = array(
        'AssetID' => array(
            'notnull' => false
            ,'type' => 'integer'
            ,'unsigned' => true
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array ('Closed', 'Open')
            ,'default' => 'Open'
        )
        ,'AssigneeID' => array(
            'notnull' => false
            ,'type' => 'uint'
        )
        ,'Type' => array(
            'type' => 'enum'
            ,'values' => array ('Repair', 'Quarantine', 'Image', 'Other')
            ,'default' => 'Repair'
        ),
        'Description' => array(
            'type' => 'clob',
            'notnull' => false
        ),
        'Name' => array(
            'notnull' => false    
        )
    );

    public static $relationships = array(
        'Assignee' => array(
            'type' => 'one-one'
            ,'class' => 'Emergence\\People\\Person'
        )
        ,'Asset' => array(
            'type' => 'one-one'
            ,'class' => 'Slate\\Assets\\Asset'
        )
    );

    public static $dynamicFields = array(
        'Assignee',
        'Asset'
    );
    
    //ActivityRecord cfg
    public static $deltaRelationFields = array(
        'AssetID' => array(
            'class' => 'Slate\\Assets\\Asset'
            ,'displayField' => 'ID'
            ,'displayKey' => 'Assigned Asset'
        )
        ,'AssigneeID' => array(
            'class' => 'Emergence\\People\\Person'
            ,'displayField' => 'FullName'
            ,'displayKey' => 'Assigned Tech'
        )
    );
    
    public static $sorters = [
        'Assignee' => [__CLASS__, 'sortAssignee']
    ];
    
    public static function sortAssignee($dir, $name)
    {
        $tableAlias = static::getTableAlias();
        $sql =
            " IF(${tableAlias}.${name}ID IS NULL, NULL,".
                " (SELECT CONCAT(FirstName, ' ', LastName) FROM `people` Person WHERE Person.ID = ${tableAlias}.${name}ID)".
            ") ${dir}";
        return [$sql];
    }
    
    public static function getOpenCount()
    {
        return static::_getTicketsCountByStatus('Open');
    }
    
    public static function getClosedCount()
    {
        return static::_getTicketsCountByStatus('Closed');  
    }
    
    protected static function _getTicketsCountByStatus($status)
    {
        return (integer) \DB::oneValue('SELECT COUNT(*) AS Count FROM `%s` WHERE Status = "%s"', array(static::$tableName, $status));
    }
}