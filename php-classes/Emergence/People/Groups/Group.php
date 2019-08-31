<?php

namespace Emergence\People\Groups;

use DB;
use ActiveRecord;
use HandleBehavior, NestingBehavior;
use Person; // TODO: use Emergence\People\Person instead in skeleton-v2+
use Emergence\People\IPerson;
use PeopleRequestHandler;
use DuplicateKeyException;
use TableNotFoundException;

class Group extends ActiveRecord
{
    // ActiveRecord configuration
    public static $tableName = 'groups';
    public static $singularNoun = 'group';
    public static $pluralNoun = 'groups';

    // the lowest-level class in your table requires these lines,
    // they can be manipulated via config files to plug in same-table subclasses
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__, 'Emergence\People\Groups\Organization');

    public static $fields = array(
        'Name'
        ,'Handle' => array(
            'unique' => true
        )
        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Active', 'Disabled')
            ,'default' => 'Active'
        )
        ,'ParentID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'Left' => array(
            'type' => 'uint'
            ,'notnull' => false
            ,'unique' => true
        )
        ,'Right' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'Founded' => array(
            'type' => 'timestamp'
            ,'default' => null
        )
        ,'About' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Members' => array(
            'type' => 'one-many'
            ,'class' => 'Emergence\People\Groups\GroupMember'
            ,'foreign' => 'GroupID'
        )
        ,'Parent' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
        )
        ,'People' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Emergence\People\Groups\GroupMember'
            ,'linkLocal' => 'GroupID'
            ,'linkForeign' => 'PersonID'
        )
    );

    public static $dynamicFields = array(
        'FullPath' => array(
            'method' => 'getFullPath'
        )
        ,'Population' => array(
            'method' => 'getPopulation'
        )
    );

    public static $validators = array(
        'Name' => array(
            'errorMessage' => 'A name is required'
        )
    );

    public static function getByHandle($handle)
    {
        return is_numeric($handle) ? static::getByID($handle) : static::getByField('Handle', $handle);
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

    public function save($deep = true)
    {
        if (!$this->Founded) {
            $this->Founded = time();
        }

        // implement handles
        HandleBehavior::onSave($this, strtolower($this->Name));

        // implement nesting
        NestingBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }

    public function destroy()
    {
        parent::destroy();

        NestingBehavior::onDestroy($this);
    }

    public function getAllPeople()
    {
        $order = PeopleRequestHandler::$browseOrder ? Person::mapFieldOrder(PeopleRequestHandler::$browseOrder) : array();

        array_unshift($order, 'GroupMember.Rank DESC');

        return Person::getAllByQuery(
            'SELECT Person.*'
            .' FROM `%s` GroupMember'
            .' JOIN `%s` Person ON (Person.ID = GroupMember.PersonID)'
            .' WHERE GroupMember.GroupID IN (SELECT ID FROM `%s` WHERE `Left` BETWEEN %u AND %u)'
            .' ORDER BY '.join(',', $order)
            ,array(
                GroupMember::$tableName
                ,Person::$tableName
                ,Group::$tableName
                ,$this->Left
                ,$this->Right
            )
        );
    }

    public function getFullPath($separator = '/')
    {
        return DB::oneValue(
            'SELECT GROUP_CONCAT(Name SEPARATOR "%s") FROM `%s` WHERE `Left` <= %u AND `Right` >= %u ORDER BY `Left`'
            ,array(
                DB::escape($separator)
                ,static::$tableName
                ,$this->Left
                ,$this->Right
            )
        );
    }

    public function getPopulation()
    {
        try {
            return (integer)DB::oneValue(
                'SELECT COUNT(*) FROM (SELECT ID FROM `%s` WHERE `Left` BETWEEN %u AND %u) `Group` JOIN `%s` GroupMember ON GroupID = `Group`.ID'
                ,array(
                    static::$tableName
                    ,$this->Left
                    ,$this->Right
                    ,GroupMember::$tableName
                )
            );
        } catch (TableNotFoundException $e) {
            return 0;
        }
    }

    public static function setPersonGroups(IPerson $Person, $groupIDs)
    {
        $assignedGroups = array();

        if (is_string($groupIDs)) {
            $groupIDs = preg_split('/\s*[,]+\s*/', trim($groupIDs));
        }

        foreach ($groupIDs AS $groupID) {
            if (!$groupID) {
                continue;
            }

            if ($Group = static::getByHandle($groupID)) {
                $Group->assignMember($Person);
                $assignedGroups[] = $Group->ID;
            }
        }

        // delete tags
        try {
            DB::query(
                'DELETE FROM `%s` WHERE PersonID = %u AND GroupID NOT IN (%s)'
                ,array(
                    GroupMember::$tableName
                    ,$Person->ID
                    ,count($assignedGroups) ? join(',', $assignedGroups) : '0'
                )
            );
        } catch (TableNotFoundException $e) {
            // no groups need to be deleted
        }

        return $assignedGroups;
    }

    public function assignMember(IPerson $Person, $memberData = array())
    {
        $memberData['GroupID'] = $this->ID;
        $memberData['PersonID'] = $Person->ID;

        try {
            return GroupMember::create($memberData, true);
        } catch (DuplicateKeyException $e) {
            // TODO: should an existing group be updated by $memberData fields?
            return GroupMember::getByWhere($memberData);
        }
    }
}