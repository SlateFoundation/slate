<?php

namespace Emergence\People;

class Relationship extends \VersionedRecord
{
    public static $templates = array(
        'mother' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Person' => array('Gender' => 'Female')
            ,'Inverse' => array(
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            )
        )
        ,'father' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            )
        )
        ,'parent' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Inverse' => array(
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            )
        )
        ,'guardian' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Inverse' => 'dependent'
        )
        ,'grandmother' => array(
            'Person' => array('Gender' => 'Female')
            ,'Inverse' => array(
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            )
        )
        ,'grandfather' => array(
            'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            )
        )
        ,'grandparent' => array(
            'Inverse' => array(
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            )
        )
        ,'stepmother' => array(
            'Person' => array('Gender' => 'Female')
            ,'Inverse' => array(
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            )
        )
        ,'stepfather' => array(
            'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            )
        )
        ,'stepparent' => array(
            'Inverse' => array(
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            )
        )
        ,'foster mother' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Person' => array('Gender' => 'Female')
            ,'Inverse' => array(
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            )
        )
        ,'foster father' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            )
        )
        ,'foster parent' => array(
            'Relationship' => array('Class' => 'Emergence\\People\\GuardianRelationship')
            ,'Inverse' => array(
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            )
        )
        ,'aunt' => array(
            'Person' => array('Gender' => 'Female')
            ,'Inverse' => array(
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            )
        )
        ,'uncle' => array(
            'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            )
        )
        ,'pibling' => array(
            'Inverse' => array(
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            )
        )
        ,'sister' => array(
            'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            )
        )
        ,'brother' => array(
            'Person' => array('Gender' => 'Male')
            ,'Inverse' => array(
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            )
        )
        ,'sibling' => array(
            'Inverse' => array(
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            )
        )
        ,'cousin' => array(
            'Inverse' => array(
                'Male' => 'cousin'
                ,'Female' => 'cousin'
                ,'Neutral' => 'cousin'
            )
        )
    );


    // VersionedRecord configuration
    public static $historyTable = 'history_relationships';

    // ActiveRecord configuration
    public static $tableName = 'relationships';
    public static $singularNoun = 'relationship';
    public static $pluralNoun = 'relationships';
    public static $collectionRoute = '/relationships';

    // required for shared-table subclassing support
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__, 'Emergence\People\GuardianRelationship');

    public static $fields = array(
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
        ,'Label'
        ,'Notes' => array(
            'notnull' => false
        )
    );


    public static $relationships = array(
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

    public static $searchConditions = array(
        'PersonID' => array(
            'qualifiers' => array('any', 'personid')
            ,'points' => 2
            ,'sql' => 'PersonID LIKE "%%%s%%"',
        )
    );

    public static $indexes = array(
        'PersonRelationship' => array(
            'fields' => array('PersonID', 'RelatedPersonID')
            ,'unique' => true
        )
    );

    public static $dynamicFields = array(
        'Person',
        'RelatedPerson',
        'InverseRelationship'
    );


    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        if (!$this->Person || !$this->Person->isA('Emergence\People\Person')) {
            $this->_validator->addError('Person', 'Person is required');
        }

        if (!$this->RelatedPerson || !$this->RelatedPerson->isA('Emergence\People\Person')) {
            $this->_validator->addError('RelatedPerson', 'Related person must be a full name or match an existing person');
        }

        // check for duplicate
        if (!$this->_validator->hasErrors() && $this->isFieldDirty('RelatedPersonID')) {
            if ($this->PersonID == $this->RelatedPersonID) {
                $this->_validator->addError('RelatedPerson', 'A person can not be related to themselves');
            } else {
                $conditions = array(
                    'PersonID' => $this->PersonID,
                    'RelatedPersonID' => $this->RelatedPersonID
                );
    
                if (!$this->isPhantom) {
                    $conditions[] = "ID != $this->ID";
                }
    
                if (static::getByWhere($conditions)) {
                    $this->_validator->addError('RelatedPerson', 'There is already a relationship defined between these people');
                }
            }
        }

        // save results
        return $this->finishValidation();
    }


    public static function getAllByPerson($Person)
    {
        return static::getAllByField('PersonID', is_a($Person, 'Emergence\People\Person') ? $Person->ID : $Person);
    }

    public static function getInverseRelationshipConditions($Relationship)
    {
        return array('PersonID' => $Relationship->RelatedPersonID);
    }
}