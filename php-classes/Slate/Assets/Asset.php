<?php

namespace Slate\Assets;

use DB;
use JSON;
use TableNotFoundException;
use Slate\Assets\Status;
use Emergence\Locations\Location;
use Emergence\People\Person;

class Asset extends \ActivityRecord
{
    public static $aliasTypes = ['MfrSerial', 'MacAddress'];

    // ActiveRecord configuration
    public static $tableName = 'assets';
    public static $singularNoun = 'asset';
    public static $pluralNoun = 'assets';

    // the lowest-level class in your table requires these lines,
    // they can be manipulated via config files to plug in same-table subclasses
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $searchConditions = [
        'Location' => [
            'qualifiers' => ['any','location'],
            'points' => 1,
            'sql' => 'LocationID=(SELECT Location.ID FROM locations Location WHERE Location.Handle LIKE "%%%s%%" LIMIT 1)'
        ],
        'Status' => [
            'qualifiers' => ['any','status', 'assets-status'],
            'points' => 1,
            'join' => [
                'className' => 'Slate\\Assets\\Status',
                'localField' => 'StatusID'
#                'foreignField' => 'ID'
            ],
            'callback' => 'getStatusConditions'
        ],
        'Alias' => [
            'qualifiers' => ['any','alias'],
            'points' => 1,
            'callback' => 'getAliasConditions'
        ],
        'FirstName' => [
            'qualifiers' => ['any', 'fname', 'name', 'assignee'],
            'points' => 1,
            'sql' => 'AssigneeID IN (SELECT Person.ID FROM people Person WHERE Person.FirstName LIKE "%%%s%%")'
        ],
        'LastName' => [
            'qualifiers' => ['any', 'lname', 'name', 'assignee'],
            'points' => 1,
            'sql' => 'AssigneeID IN (SELECT Person.ID FROM people Person WHERE Person.LastName LIKE "%%%s%%")'
        ]
    ];

    public static $fields = [
        'Name' => [
            'notnull' => false
        ],
        'OwnerClass' => [
            'notnull' => false
        ],
        'OwnerID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'AssigneeClass' => [
            'notnull' => false
        ],
        'AssigneeID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'LocationID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'StatusID' => [
            'type' => 'uint',
            'notnull' => false
        ],
        'Data' => [
            'type' => 'json',
            'notnull' => false
        ]
    ];

    public static $dynamicFields = [
        'Location',
        'Status',
        'Aliases',
        'Assignee',
        'Owner',
        'Activity',
        'AssigneeModified' => [
            'getter' => 'getAssigneeLastModified'
        ],
        'LocationModified' => [
            'getter' => 'getLocationLastModified'
        ],
        'StatusModified' => [
            'getter' => 'getStatusLastModified'
        ]
#        'OwnerModified' => [
#            'getter' => 'getOwnerLastModified'
#        ]
    ];

    //Required for Relating ID's to a Class in ActivityRecord
    public static $deltaRelationFields = [
        'AssigneeID' => [
            'class' => Person::class,
            'displayKey' => 'Assignee',
            'displayField' => 'FullName'
        ],
        'OwnerID' => [
            'class' => Person::class,
            'displayKey' => 'Owner',
            'displayField' => 'FullName'
        ],
        'LocationID' => [
            'class' => Location::class,
            'displayKey' => 'Location',
            'displayField' => 'Title'
        ],
        'StatusID' => [
            'class' => Status::class,
            'displayKey' => 'Status',
            'displayField' => 'Title'
        ]
    ];

    public static $relationships = [
        'Owner' => [
            'type' => 'context-parent',
            'classField' => 'OwnerClass',
            'local' => 'OwnerID'
        ],
        'Assignee' => [
            'type' => 'context-parent',
            'classField' => 'AssigneeClass',
            'local' => 'AssigneeID'
        ],
        'Aliases' => [
            'class' => Alias::class,
            'type' => 'one-many',
            'foreign' => 'ObjectID',
            'condition' => ['ObjectClass' => __CLASS__]
        ],
        'Status' => [
            'class' => Status::class,
            'type' => 'one-one'
        ],
        'Location' => [
            'class' => Location::class,
            'type' => 'one-one'
        ],
#        ,'Activity' => array(
#            'type' => 'one-many'
#            ,'class' => 'Activity'
#            ,'foreign' => 'ObjectID'
#            ,'condition' =>array('ObjectClass' => 'Slate\\Assets\\Asset')
#            ,'order' => array('ID' => 'DESC')
#        ),
        'Tickets' => [
            'class' => Ticket::class,
            'type' => 'one-many',
            'foreign' => 'AssetID',
            'order' => ['ID' => 'DESC']
        ]
    ];

    public static $sorters = array(
        'MfrSerial' => [__CLASS__, 'sortIdentifier'],
        'MacAddress' => [__CLASS__, 'sortIdentifier'],
        'Assignee' => [__CLASS__, 'sortEntity'],
        'Owner' => [__CLASS__, 'sortEntity'],
        'Status' => [__CLASS__, 'sortStatus'],
        'Location' => [__CLASS__, 'sortLocation']
    );

    public function getValue($name)
    {
        switch ($name) {
            case 'MfrSerial':
                return $this->getMfrSerial();

            case 'FullName':
                return $this->getTitle();

            default:
                return parent::getValue($name);
        }
    }

    public function getTitle()
    {
        $values = [];
        $values[] = $this->Name ?: $this->ID;
        $this->Assignee ? $values[] = $this->Assignee->FullName : false;
        $this->MfrSerial ? $values[] = $this->MfrSerial : false;

        return join(" - ", $values);
    }

    public function getMfrSerial()
    {
        $serialAlias = null;

        if (is_array($this->Aliases)) {
            foreach ($this->Aliases AS $alias) {
                if ($alias->Type == $name) {
                    $serialAlias = $alias;
                    break;
                }
            }
        }
        return $serialAlias;
    }


    public static function sortIdentifier($dir, $name)
    {
        $tableAlias = static::getTableAlias();

        //TODO remove LIMIT 1 once aliases are truly distinct.
        return ["(SELECT Identifier FROM aliases WHERE Type = '${name}' AND ObjectClass IN ('Slate\\\Assets\\\Asset', 'Asset') AND ObjectID = ${tableAlias}.ID LIMIT 1)  " . $dir];
    }

    public static function sortEntity($dir, $name)
    {
        $tableAlias = static::getTableAlias();
        $sql =
            " IF(${tableAlias}.${name}ID IS NULL, NULL,".
            " IF(${tableAlias}.${name}Class = 'Person' AND ${tableAlias}.${name}ID IS NOT NULL, ".
                " (SELECT CONCAT(FirstName, ' ', LastName) FROM `people` Person WHERE Person.ID = ${tableAlias}.${name}ID),".
                " (SELECT Name FROM `groups` Grp WHERE Grp.ID = ${tableAlias}.${name}ID)".
            " )) ${dir}";
        return [$sql];
    }

    public static function sortStatus($dir)
    {
        $tableAlias = static::getTableAlias();
        return [sprintf("IF(StatusID IS NULL, NULL, (SELECT Title FROM `%s` Status WHERE Status.ID = ${tableAlias}.StatusID)) ", Status::$tableName) . $dir];
    }

    public static function sortLocation($dir)
    {
        $tableAlias = static::getTableAlias();
        return [sprintf("IF(LocationID IS NULL, 1, 0), (SELECT Title FROM `%s` Location WHERE Location.ID = {$tableAlias}.LocationID) ", \Emergence\Locations\Location::$tableName) . $dir];
    }

    public function getStories($from = null, $to = null, $options = array(), $conditions = array())
    {
        try {
            $assetTicketIds = DB::allValues('ID', 'SELECT `ID` FROM `%s` WHERE AssetID = %u', array(Ticket::$tableName, $this->ID));
        } catch (TableNotFoundException $e) {
            $assetTicketIds = [];
        }

        try {
            $aliasIds = DB::allValues('ID', 'SELECT `ID` FROM `%s` WHERE ObjectID = %u AND ObjectClass = "%s"', array(Alias::$tableName, $this->ID, DB::escape($this->Class)));
        } catch (TableNotFoundException $e) {
            $aliasIds = [];
        }

        $options['indexField'] = 'ID';

        if (!$options['order']) {
            $orders['order'] = array('ID' => 'DESC');
        }

        $stories = parent::getStories($from, $to, $options, $conditions);

        //add ticket stories to response
        if (count($assetTicketIds)) {
            //merge conditions with asset activity conditions, only overwriting class/id
            $ticketConditions = array_merge($conditions,
                [
                    'ObjectClass' => $ticketClass,
                    'ObjectID' => [
                        'operator' => 'IN',
                        'values' => $assetTicketIds
                    ]
                ]
            );

            $indexedTicketStories = parent::getStories($from, $to, $options, $ticketConditions);

            $stories = $stories + $indexedTicketStories;
        }

        if (count($aliasIds)) {
            $aliasConditions = array_merge($conditions, [
                'ObjectClass' => $aliasClass,
                'ObjectID' => [
                    'operator' => 'IN',
                    'values' => $aliasIds
                ]
            ]);

            $options['indexField'] = 'ID';

            $indexedAliasStories = parent::getStories($from, $to, $options, $aliasConditions);
#            \MICS::dump($indexedAliasStories, 'indexed alias stories', true);
            $stories = $stories + $indexedAliasStories;
        }

        krsort($stories);
        return JSON::translateObjects(array_values($stories), false, ['changes', 'Actor']);
    }

    public static function getStatusConditions($handle, $matchedCondition)
    {

        $group = Status::getByHandle($handle);

        if (!$group) {
#            $group = Status::getByWhere(array(sprintf('Handle LIKE %%%s%%', \DB::escape($group))), array());
            return $condition = false;
        }

        $containedGroups = DB::allValues('ID', 'SELECT ID FROM %s WHERE `Left` BETWEEN %u AND %u', array(
            Status::$tableName
            ,$group->Left
            ,$group->Right
        ));

#        $condition = sprintf("JOIN `%s` ON (%s.StatusID = %s.ID) ", Status::$tableName, static::getTableAlias(), Status::getTableAlias());
#        $condition = Status::getTableAlias().'.ID'.' IN ('.implode(',',$containedGroups).')';
        $condition = sprintf('%s.ID IN (%s)', Status::getTableAlias(), implode(',', $containedGroups));

        return $condition;
    }

    public static function getAliasConditions($handle, $matchedCondition)
    {
        return static::getTableAlias() . sprintf(".ID IN (SELECT Alias.ObjectID FROM aliases Alias WHERE Alias.ObjectClass = 'Slate\\\Assets\\\Asset' AND Alias.Identifier LIKE '%%%s%%')", $handle);
    }

    public function getAssigneeLastModified()
    {
        return $this->_getDeltaFieldLastModified('AssigneeID');
    }

    public function getLocationLastModified()
    {
        return $this->_getDeltaFieldLastModified('LocationID');
    }

    public function getStatusLastModified()
    {
        return $this->_getDeltaFieldLastModified('StatusID');
    }

    public function getOwnerLastModified()
    {
        return $this->_getDeltaFieldLastModified('OwnerID');
    }

    protected function _getDeltaFieldLastModified($fieldName)
    {
        $latestActivity;

        $Activity = \DeltaActivity::getAllByWhere([
            'ObjectID' => $this->ID,
            'ObjectClass' => $this->Class,
            sprintf('Data LIKE "%%%s%%"', $fieldName)
        ], ['order' => ['ID' => 'DESC']]);

        foreach ($Activity AS $Activity) {
            if ($Activity->Data[$fieldName]) {
                $latestActivity = $Activity;
                break;
            }
        }
#        if ($latestActivity) {
#            $latestActivity = date("D, M jS", $latestActivity->Created);
#        }
        return $latestActivity;
    }
}