<?php

namespace Emergence\People;

class Relationship extends \VersionedRecord
{
    static public $relationshipTypes = array(
        'Mother' => array(
            'Person' => array('Gender' => 'Female')
            ,'Relationship' => array('Class' => 'Guardian')
        )
        ,'Father' => array(
            'Person' => array('Gender' => 'Male')
            ,'Relationship' => array('Class' => 'Guardian')
        )
        ,'Guardian' => array(
            'Relationship' => array('Class' => 'Guardian')
        )
        ,'Foster Mother' => array(
            'Person' => array('Gender' => 'Female')
            ,'Relationship' => array('Class' => 'Guardian')
        )
        ,'Foster Father' => array(
            'Person' => array('Gender' => 'Male')
            ,'Relationship' => array('Class' => 'Guardian')
        )
        ,'Grandmother' => array(
            'Person' => array('Gender' => 'Female')
        )
        ,'Grandfather' => array(
            'Person' => array('Gender' => 'Male')
        )
        ,'Stepmother' => array(
            'Person' => array('Gender' => 'Female')
        )
        ,'Stepfather' => array(
            'Person' => array('Gender' => 'Male')
        )
        ,'Aunt' => array(
            'Person' => array('Gender' => 'Female')
        )
        ,'Uncle' => array(
            'Person' => array('Gender' => 'Male')
        )
        ,'Sister' => array(
            'Person' => array('Gender' => 'Male')
        )
        ,'Brother' => array(
            'Person' => array('Gender' => 'Male')
        )
        ,'Unknown' => array()
    );


    // VersionedRecord configuration
    static public $historyTable = 'history_relationships';

    // ActiveRecord configuration
    static public $tableName = 'relationships';
    static public $singularNoun = 'relationship';
    static public $pluralNoun = 'relationships';

    // required for shared-table subclassing support
    static public $rootClass = __CLASS__;
    static public $defaultClass = __CLASS__;
    static public $subClasses = array(__CLASS__, 'Emergence\\People\\GuardianRelationship');

    static public $fields = array(
        'PersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'RelatedPersonID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        )
        ,'Relationship' => array(
            'notnull' => false
        )
        ,'Notes' => array(
            'notnull' => false
        )
    );


    static public $relationships = array(
        'Person' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
        ,'RelatedPerson' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
        )
        ,'InverseRelationship' => array(
            'type' => 'one-one'
            ,'class' => __CLASS__
            ,'local' => 'PersonID'
            ,'foreign' => 'RelatedPersonID'
            ,'conditions' => array(__CLASS__, 'getInverseRelationshipConditions')
        )
    );

    static public $searchConditions = array(
        'PersonID' => array(
            'qualifiers' => array('any', 'personid')
            ,'points' => 2
            ,'sql' => 'PersonID LIKE "%%%s%%"',
        )
    );

    static public $indexes = array(
        'PersonRelationship' => array(
            'fields' => array('PersonID', 'RelatedPersonID')
            ,'unique' => true
        )
    );
    
    static public $dynamicFields = array(
        'Person',
        'RelatedPerson',
        'InverseRelationship'
    );

#    public function getData()
#    {
#        return array_merge(parent::getData(), array(
#            'RelatedPerson' => $this->RelatedPerson ? $this->RelatedPerson->getData() : null
#            ,'ContactPoints' => $this->RelatedPerson ? JSON::translateObjects($this->RelatedPerson->ContactPoints) : null
#        ));
#    }


    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->Person || !$this->Person->isA('Person')) {
            $this->_validator->addError('Person', 'Person is required');
        }

        if (!$this->RelatedPerson || !$this->RelatedPerson->isA('Person')) {
            $this->_validator->addError('RelatedPerson', 'Related person must be a full name or match an existing person');
        }

        // save results
        return $this->finishValidation();
    }


    static public function getAllByPerson($Person)
    {
        return static::getAllByField('PersonID', is_a($Person, 'Person') ? $Person->ID : $Person);
    }

    static public function setRelationship($Person, $RelatedPerson, $relationship)
    {
        try {
            $Relationship = Relationship::create(array(
                'Person' => $Person
                ,'RelatedPerson' => $RelatedPerson
                ,'Relationship' => $relationship
            ), true);
        } catch (\DuplicateKeyException $e) {
            $Relationship = Relationship::getByWhere(array(
                'PersonID' => $Person->ID
                ,'RelatedPersonID' => $RelatedPerson->ID
            ));
            $Relationship->Relationship = $relationship;
            $Relationship->save();
        }

        return $Relationship;
    }
    
    public static function getInverseRelationshipConditions($Relationship)
    {
        return array('PersonID' => $Relationship->RelatedPersonID);
    }
}