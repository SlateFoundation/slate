<?php

namespace Emergence\People;

class Relationship extends \VersionedRecord
{
    public static $templates = [
        'mother' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            ]
        ]
        ,'father' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            ]
        ]
        ,'parent' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Inverse' => [
                'Male' => 'son'
                ,'Female' => 'daughter'
                ,'Neutral' => 'child'
            ]
        ]
        ,'guardian' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Inverse' => 'dependent'
        ]
        ,'grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            ]
        ]
        ,'grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            ]
        ]
        ,'grandparent' => [
            'Inverse' => [
                'Male' => 'grandson'
                ,'Female' => 'granddaughter'
                ,'Neutral' => 'grandchild'
            ]
        ]
        ,'great grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'great grandson'
                ,'Female' => 'great granddaughter'
                ,'Neutral' => 'great grandchild'
            ]
        ]
        ,'great grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'great grandson'
                ,'Female' => 'great granddaughter'
                ,'Neutral' => 'great grandchild'
            ]
        ]
        ,'great grandparent' => [
            'Inverse' => [
                'Male' => 'great grandson'
                ,'Female' => 'great granddaughter'
                ,'Neutral' => 'great grandchild'
            ]
        ]
        ,'stepmother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            ]
        ]
        ,'stepfather' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            ]
        ]
        ,'stepparent' => [
            'Inverse' => [
                'Male' => 'stepson'
                ,'Female' => 'stepdaughter'
                ,'Neutral' => 'stepchild'
            ]
        ]
        ,'foster mother' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            ]
        ]
        ,'foster father' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            ]
        ]
        ,'foster parent' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Inverse' => [
                'Male' => 'foster son'
                ,'Female' => 'foster daughter'
                ,'Neutral' => 'foster child'
            ]
        ]
        ,'godmother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'godson'
                ,'Female' => 'goddaughter'
                ,'Neutral' => 'godchild'
            ]
        ]
        ,'godfather' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'godson'
                ,'Female' => 'goddaughter'
                ,'Neutral' => 'godchild'
            ]
        ]
        ,'godparent' => [
            'Inverse' => [
                'Male' => 'godson'
                ,'Female' => 'goddaughter'
                ,'Neutral' => 'godchild'
            ]
        ]
        ,'host mother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'host son'
                ,'Female' => 'host daughter'
                ,'Neutral' => 'host child'
            ]
        ]
        ,'host father' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'host son'
                ,'Female' => 'host daughter'
                ,'Neutral' => 'host child'
            ]
        ]
        ,'host parent' => [
            'Inverse' => [
                'Male' => 'host son'
                ,'Female' => 'host daughter'
                ,'Neutral' => 'host child'
            ]
        ]
        ,'host grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'host grandson'
                ,'Female' => 'host granddaughter'
                ,'Neutral' => 'host grandchild'
            ]
        ]
        ,'host grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'host grandson'
                ,'Female' => 'host granddaughter'
                ,'Neutral' => 'host grandchild'
            ]
        ]
        ,'host grandparent' => [
            'Inverse' => [
                'Male' => 'host grandson'
                ,'Female' => 'host granddaughter'
                ,'Neutral' => 'host grandchild'
            ]
        ]
        ,'aunt' => [
            'Person' => ['Gender' => 'Female']
            ,'Inverse' => [
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            ]
        ]
        ,'uncle' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            ]
        ]
        ,'pibling' => [
            'Inverse' => [
                'Male' => 'nephew'
                ,'Female' => 'niece'
                ,'Neutral' => 'nibling'
            ]
        ]
        ,'sister' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            ]
        ]
        ,'brother' => [
            'Person' => ['Gender' => 'Male']
            ,'Inverse' => [
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            ]
        ]
        ,'sibling' => [
            'Inverse' => [
                'Male' => 'brother'
                ,'Female' => 'sister'
                ,'Neutral' => 'sibling'
            ]
        ]
        ,'cousin' => [
            'Inverse' => [
                'Male' => 'cousin'
                ,'Female' => 'cousin'
                ,'Neutral' => 'cousin'
            ]
        ]
        ,'coach' => [
            'Inverse' => 'trainee'
        ]
    ];


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
    public static $subClasses = [__CLASS__, 'Emergence\People\GuardianRelationship'];

    public static $fields = [
        'PersonID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'RelatedPersonID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'index' => true
        ]
        ,'Label'
        ,'Notes' => [
            'notnull' => false
        ]
    ];


    public static $relationships = [
        'Person' => [
            'type' => 'one-one'
            ,'class' => 'Person'
        ]
        ,'RelatedPerson' => [
            'type' => 'one-one'
            ,'class' => 'Person'
        ]
        ,'InverseRelationship' => [
            'type' => 'one-one'
            ,'class' => __CLASS__
            ,'local' => 'PersonID'
            ,'foreign' => 'RelatedPersonID'
            ,'conditions' => [__CLASS__, 'getInverseRelationshipConditions']
        ]
    ];

    public static $searchConditions = [
        'PersonID' => [
            'qualifiers' => ['any', 'personid']
            ,'points' => 2
            ,'sql' => 'PersonID LIKE "%%%s%%"',
        ]
    ];

    public static $indexes = [
        'PersonRelationship' => [
            'fields' => ['PersonID', 'RelatedPersonID']
            ,'unique' => true
        ]
    ];

    public static $dynamicFields = [
        'Person',
        'RelatedPerson',
        'InverseRelationship'
    ];


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
                $conditions = [
                    'PersonID' => $this->PersonID,
                    'RelatedPersonID' => $this->RelatedPersonID
                ];

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
        return ['PersonID' => $Relationship->RelatedPersonID];
    }

    public static function getTemplates()
    {
        $templates = [];

        foreach (static::$templates AS $label => $options) {
            $options['Relationship']['Label'] = $label;
            $templates[$label] = $options;

            // add inverse relationships
            if (!empty($options['Inverse']) && is_array($options['Inverse'])) {
                foreach ($options['Inverse'] AS $gender => $relationship) {
                    $templates[$relationship] = [
                        'Relationship' => [
                            'Label' => $relationship
                        ],
                        'Inverse' => static::getInverseRelationships($relationship)
                    ];
                    if ($gender == 'Male' || $gender == 'Female') {
                        $templates[$relationship]['Person'] = ['Gender' => $gender];
                    }
                }
            }
        }

        return $templates;
    }

    public static function getInverseRelationships($relationship)
    {
        $relationships = [];

        foreach (static::$templates as $relationshipName => $relationshipData) {
            $inverseRelationship = is_array($relationshipData['Inverse']) ? array_values($relationshipData['Inverse']) : [$relationshipData['Inverse']];
            $relationshipGender = !empty($relationshipData['Person']['Gender']) ? $relationshipData['Person']['Gender'] : 'Neutral';

            if (!empty($relationshipData['Inverse']) && in_array($relationship, $inverseRelationship)) {
                $relationships[$relationshipGender] = $relationshipName;
            }
        }

        return $relationships;
    }
}