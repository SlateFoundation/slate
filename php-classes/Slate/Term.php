<?php

namespace Slate;

use DB;
use HandleBehavior, NestingBehavior;

class Term extends \VersionedRecord
{
    // number of days reporting period lasts after end of a term
    static public $reportingPeriod = 14;

    // VersionedRecord configuration
    static public $historyTable = 'history_terms';

    // ActiveRecord configuration
    static public $tableName = 'terms';
    static public $singularNoun = 'term';
    static public $pluralNoun = 'terms';
    static public $collectionRoute = '/terms';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__);

    static public $fields = array(
        'Title' => array(
            'fulltext' => true
            ,'notnull' => false
        )
        ,'Handle' => array(
            'unique' => true
            ,'notnull' => false
        )

        ,'Status' => array(
            'type' => 'enum'
            ,'values' => array('Hidden','Live','Deleted')
            ,'default' => 'Live'
        )
        ,'StartDate' => array(
            'type' => 'date'
            ,'notnull' => false
        )
        ,'EndDate' => array(
            'type' => 'date'
            ,'notnull' => false
        )

        ,'ParentID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
        ,'Left' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'unique' => true
            ,'notnull' => false
        )
        ,'Right' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
        )
    );

    static public $relationships = array(
        'Parent' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
        )
    );

    static public $searchConditions = array(
        'Title' => array(
            'qualifiers' => array('any','title')
            ,'points' => 2
            ,'sql' => 'Title LIKE "%%%s%%"'
        )
        ,'Handle' => array(
            'qualifiers' => array('any','handle')
            ,'points' => 2
            ,'sql' => 'Handle LIKE "%%%s%%"'
        )
    );

    static public function getCurrent()
    {
        return static::getByWhere('CURRENT_DATE BETWEEN StartDate AND EndDate', array('order' => '`Right` - `Left`'));
    }

    static public function getCurrentReporting()
    {
        $Term = static::getCurrent();

        if ((time() - strtotime($Term->StartDate)) / (60 * 60 * 24) <= static::$reportingPeriod) {
            $Term = $Term->getPreviousSibling();
        }

        return $Term;
    }

    static public function getPrevious()
    {
        return static::getByWhere('Status = "Live" AND EndDate < CURRENT_TIMESTAMP', array('order' => 'EndDate DESC, `Right` - `Left`'));
    }

    static public function getNext()
    {
        return static::getByWhere('Status = "Live" AND StartDate > CURRENT_TIMESTAMP', array('order' => 'StartDate ASC, `Right` - `Left`'));
    }

    static public function getByHandle($handle)
    {
        return static::getByField('Handle', $handle, true);
    }

    static public function getOrCreateByHandle($handle)
    {
        if ($Term = static::getByHandle($handle)) {
            return $Term;
        } else {
            return static::create(array(
                'Title' => $handle
                ,'Handle' => $handle
            ), true);
        }
    }

    static public function getOrCreateByTitle($title)
    {
        if ($Term = static::getByField('Title', $title)) {
            return $Term;
        } else {
            return static::create(array(
                'Title' => $title
            ), true);
        }
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate();

        $this->_validator->validate(array(
            'field' => 'Title'
            ,'errorMessage' => 'A title is required'
            ,'required' => false
        ));

        // implement handles
        HandleBehavior::onValidate($this, $this->_validator);

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true, $createRevision = true)
    {
        // implement handles
        HandleBehavior::onSave($this);

        // implement nesting
        NestingBehavior::onSave($this);

        // call parent
        parent::save($deep, $createRevision);
    }


    public function getConcurrentTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%s` Term WHERE Term.Left <= %u AND Term.Right >= %u ORDER BY Term.Left DESC'
            ,array(static::$tableName, $this->Left, $this->Right)
        );
    }

    public function getContainedTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%s` Term WHERE Term.Left >= %u AND Term.Right <= %u ORDER BY Term.Left DESC'
            ,array(static::$tableName, $this->Left, $this->Right)
        );
    }

    public function getRelatedTermIDs()
    {
        return DB::allValues(
            'ID'
            ,'SELECT ID FROM `%1$s` Term WHERE (Term.Left >= %2$u AND Term.Right <= %3$u) OR (Term.Left <= %2$u AND Term.Right >= %3$u) ORDER BY Term.Left DESC'
            ,array(static::$tableName, $this->Left, $this->Right)
        );
    }

    public function getLongestParent()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Left <= %u AND Term.Right >= %u ORDER BY Term.Left ASC LIMIT 1'
            ,array(static::$tableName, $this->Left, $this->Right)
        );
    }

    public function getPreviousSibling()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Right < %u AND Term.Right - Term.Left = %u ORDER BY Term.Right DESC LIMIT 1'
            ,array(static::$tableName, $this->Left, $this->Right - $this->Left)
        );
    }

    public function getNextSibling()
    {
        return static::getByQuery(
            'SELECT * FROM `%s` Term WHERE Term.Left > %u AND Term.Right - Term.Left = %u ORDER BY Term.Left ASC LIMIT 1'
            ,array(static::$tableName, $this->Right, $this->Right - $this->Left)
        );
    }

    public function getFuzzyTitle()
    {
        $regexTermArray = array(
            '/(\d{4}-\d{2}): (\d{1,}\w{2} Quarter)/' => 'Quarter'
            ,'/(\d{4}-\d{2})\.S(\d{1})/' => 'Semester'
            ,'/(\d{4}-\d{2})/' => 'School Year'
        );

        foreach ($regexTermArray as $regex => $term) {
            preg_match($regex, $this->Title, $matches);

            if ($matches) {
                $fuzzyTitle = $matches[1];

                if ($term == 'Quarter') {
                    $fuzzyTitle .= ' '. $matches[2];
                } elseif ($term == 'Semester') {
                    $semester = $matches[2] == 1 ? '1st' : '2nd' ;
                    $fuzzyTitle .=  ' '.$semester.' Semester';
                }

                return $fuzzyTitle;
            }

        }
    }
}
