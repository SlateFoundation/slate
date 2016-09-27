<?php

namespace Slate;

use DB;
use HandleBehavior, NestingBehavior;

class Term extends \VersionedRecord
{
    // number of days reporting period lasts after end of a term
    public static $reportingPeriod = 14;

    // VersionedRecord configuration
    public static $historyTable = 'history_terms';

    // ActiveRecord configuration
    public static $tableName = 'terms';
    public static $singularNoun = 'term';
    public static $pluralNoun = 'terms';
    public static $collectionRoute = '/terms';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    public static $fields = [
        'Title' => [
            'fulltext' => true
            ,'notnull' => false
        ]
        ,'Handle' => [
            'unique' => true
            ,'notnull' => false
        ]

        ,'Status' => [
            'type' => 'enum'
            ,'values' => ['Hidden','Live','Deleted']
            ,'default' => 'Live'
        ]
        ,'StartDate' => [
            'type' => 'date'
            ,'notnull' => false
        ]
        ,'EndDate' => [
            'type' => 'date'
            ,'notnull' => false
        ]

        ,'ParentID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
        ,'Left' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'unique' => true
            ,'notnull' => false
        ]
        ,'Right' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Parent' => [
            'type' => 'one-one'
            ,'class' => __CLASS__
        ]
    ];

    public static $searchConditions = [
        'Title' => [
            'qualifiers' => ['any','title']
            ,'points' => 2
            ,'sql' => 'Title LIKE "%%%s%%"'
        ]
        ,'Handle' => [
            'qualifiers' => ['any','handle']
            ,'points' => 2
            ,'sql' => 'Handle LIKE "%%%s%%"'
        ]
    ];

    public static function getClosest()
    {
        if ($Term = static::getCurrent()) {
            return $Term;
        }

        if ($Term = static::getNext()) {
            return $Term;
        }

        if ($Term = static::getPrevious()) {
            return $Term;
        }

        return null;
    }

    public static function getCurrent()
    {
        return static::getByWhere('CURRENT_DATE BETWEEN StartDate AND EndDate', ['order' => '`Right` - `Left`']);
    }

    public static function getCurrentReporting()
    {
        $Term = static::getCurrent();

        if ((time() - strtotime($Term->StartDate)) / (60 * 60 * 24) <= static::$reportingPeriod) {
            $Term = $Term->getPreviousSibling();
        }

        return $Term;
    }

    public static function getLastTerm()
    {
        return static::getByWhere('Status = "Live"', ['order' => 'EndDate DESC, `Right` - `Left`']);
    }

    public static function getPrevious()
    {
        return static::getByWhere('Status = "Live" AND EndDate < CURRENT_TIMESTAMP', ['order' => 'EndDate DESC, `Right` - `Left`']);
    }

    public static function getNext()
    {
        return static::getByWhere('Status = "Live" AND StartDate > CURRENT_TIMESTAMP', ['order' => 'StartDate ASC, `Right` - `Left`']);
    }

    public static function getAllMaster()
    {
        return static::getAllByWhere('ParentID IS NULL', ['order' => 'StartDate DESC']);
    }

    public static function getOrCreateByHandle($handle)
    {
        if ($Term = static::getByHandle($handle)) {
            return $Term;
        } else {
            return static::create([
                'Title' => $handle
                ,'Handle' => $handle
            ], true);
        }
    }

    public static function getOrCreateByTitle($title, $save = false)
    {
        if ($Term = static::getByField('Title', $title)) {
            return $Term;
        } else {
            return static::create([
                'Title' => $title
            ], $save);
        }
    }

    public static function getClosestGraduationYear()
    {
        if (!$Term = static::getClosest()) {
            return null;
        }

        return (int)substr($Term->getMaster()->EndDate, 0, 4);
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate([
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
            ,'required' => false
        ]);

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        // implement nesting
        NestingBehavior::onSave($this);

        // call parent
        parent::save($deep);
    }


    public function getConcurrentTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%s` Term WHERE Term.Left <= %u AND Term.Right >= %u ORDER BY Term.Left DESC'
            ,[static::$tableName, $this->Left, $this->Right]
        );
    }

    public function getContainedTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%s` Term WHERE Term.Left >= %u AND Term.Right <= %u ORDER BY Term.Left DESC'
            ,[static::$tableName, $this->Left, $this->Right]
        );
    }

    public function getRelatedTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%1$s` Term WHERE (Term.Left >= %2$u AND Term.Right <= %3$u) OR (Term.Left <= %2$u AND Term.Right >= %3$u) ORDER BY Term.Left DESC'
            ,[static::$tableName, $this->Left, $this->Right]
        );
    }

    public function getMaster()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Left <= %u AND Term.Right >= %u ORDER BY Term.Left ASC LIMIT 1'
            ,[static::$tableName, $this->Left, $this->Right]
        );
    }

    public function getPreviousSibling()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Right < %u AND Term.Right - Term.Left = %u ORDER BY Term.Right DESC LIMIT 1'
            ,[static::$tableName, $this->Left, $this->Right - $this->Left]
        );
    }

    public function getNextSibling()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Left > %u AND Term.Right - Term.Left = %u ORDER BY Term.Left ASC LIMIT 1'
            ,[static::$tableName, $this->Right, $this->Right - $this->Left]
        );
    }

    public function getFuzzyTitle()
    {
        // TODO: figure out what this is used for and update to use new q/s/y prefix scheme
        $regexTermArray = [
            '/(\d{4}-\d{2}): (\d{1,}\w{2} Quarter)/' => 'Quarter'
            ,'/(\d{4}-\d{2})\.S(\d{1})/' => 'Semester'
            ,'/(\d{4}-\d{2})/' => 'School Year'
        ];

        foreach ($regexTermArray as $regex => $term) {
            preg_match($regex, $this->Title, $matches);

            if ($matches) {
                $fuzzyTitle = $matches[1];

                if ($term == 'Quarter') {
                    $fuzzyTitle .= ' '.$matches[2];
                } elseif ($term == 'Semester') {
                    $semester = $matches[2] == 1 ? '1st' : '2nd' ;
                    $fuzzyTitle .=  ' '.$semester.' Semester';
                }

                return $fuzzyTitle;
            }
        }
    }
}
