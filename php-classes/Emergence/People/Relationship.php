<?php

namespace Emergence\People;

class Relationship extends \VersionedRecord
{
    public static $templates = [
        'mother' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'son'
                    ,'Female' => 'daughter'
                    ,'Neutral' => 'child'
                ]
            ]
        ]
        ,'father' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'son'
                    ,'Female' => 'daughter'
                    ,'Neutral' => 'child'
                ]
            ]
        ]
        ,'parent' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'son'
                    ,'Female' => 'daughter'
                    ,'Neutral' => 'child'
                ]
            ]
        ]
        ,'guardian' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'InverseRelationship' => [
                'Label' => [
                    'Neutral' => 'ward'
                ]
            ]
        ]
        ,'grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'grandson'
                    ,'Female' => 'granddaughter'
                    ,'Neutral' => 'grandchild'
                ]
            ]
        ]
        ,'grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'grandson'
                    ,'Female' => 'granddaughter'
                    ,'Neutral' => 'grandchild'
                ]
            ]
        ]
        ,'grandparent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'grandson'
                    ,'Female' => 'granddaughter'
                    ,'Neutral' => 'grandchild'
                ]
            ]
        ]
        ,'great grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'great grandson'
                    ,'Female' => 'great granddaughter'
                    ,'Neutral' => 'great grandchild'
                ]
            ]
        ]
        ,'great grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'great grandson'
                    ,'Female' => 'great granddaughter'
                    ,'Neutral' => 'great grandchild'
                ]
            ]
        ]
        ,'great grandparent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'great grandson'
                    ,'Female' => 'great granddaughter'
                    ,'Neutral' => 'great grandchild'
                ]
            ]
        ]
        ,'stepmother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'stepson'
                    ,'Female' => 'stepdaughter'
                    ,'Neutral' => 'stepchild'
                ]
            ]
        ]
        ,'stepfather' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'stepson'
                    ,'Female' => 'stepdaughter'
                    ,'Neutral' => 'stepchild'
                ]
            ]
        ]
        ,'stepparent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'stepson'
                    ,'Female' => 'stepdaughter'
                    ,'Neutral' => 'stepchild'
                ]
            ]
        ]
        ,'foster mother' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'foster son'
                    ,'Female' => 'foster daughter'
                    ,'Neutral' => 'foster child'
                ]
            ]
        ]
        ,'foster father' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'foster son'
                    ,'Female' => 'foster daughter'
                    ,'Neutral' => 'foster child'
                ]
            ]
        ]
        ,'foster parent' => [
            'Relationship' => ['Class' => 'Emergence\\People\\GuardianRelationship']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'foster son'
                    ,'Female' => 'foster daughter'
                    ,'Neutral' => 'foster child'
                ]
            ]
        ]
        ,'godmother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'godson'
                    ,'Female' => 'goddaughter'
                    ,'Neutral' => 'godchild'
                ]
            ]
        ]
        ,'godfather' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'godson'
                    ,'Female' => 'goddaughter'
                    ,'Neutral' => 'godchild'
                ]
            ]
        ]
        ,'godparent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'godson'
                    ,'Female' => 'goddaughter'
                    ,'Neutral' => 'godchild'
                ]
            ]
        ]
        ,'host mother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host son'
                    ,'Female' => 'host daughter'
                    ,'Neutral' => 'host child'
                ]
            ]
        ]
        ,'host father' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host son'
                    ,'Female' => 'host daughter'
                    ,'Neutral' => 'host child'
                ]
            ]
        ]
        ,'host parent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host son'
                    ,'Female' => 'host daughter'
                    ,'Neutral' => 'host child'
                ]
            ]
        ]
        ,'host grandmother' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host grandson'
                    ,'Female' => 'host granddaughter'
                    ,'Neutral' => 'host grandchild'
                ]
            ]
        ]
        ,'host grandfather' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host grandson'
                    ,'Female' => 'host granddaughter'
                    ,'Neutral' => 'host grandchild'
                ]
            ]
        ]
        ,'host grandparent' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'host grandson'
                    ,'Female' => 'host granddaughter'
                    ,'Neutral' => 'host grandchild'
                ]
            ]
        ]
        ,'aunt' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'nephew'
                    ,'Female' => 'niece'
                    ,'Neutral' => 'nibling'
                ]
            ]
        ]
        ,'uncle' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'nephew'
                    ,'Female' => 'niece'
                    ,'Neutral' => 'nibling'
                ]
            ]
        ]
        ,'pibling' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'nephew'
                    ,'Female' => 'niece'
                    ,'Neutral' => 'nibling'
                ]
            ]
        ]
        ,'sister' => [
            'Person' => ['Gender' => 'Female']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'brother'
                    ,'Female' => 'sister'
                    ,'Neutral' => 'sibling'
                ]
            ]
        ]
        ,'brother' => [
            'Person' => ['Gender' => 'Male']
            ,'InverseRelationship' => [
                'Label' => [
                    'Male' => 'brother'
                    ,'Female' => 'sister'
                    ,'Neutral' => 'sibling'
                ]
            ]
        ]
        ,'sibling' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'brother'
                    ,'Female' => 'sister'
                    ,'Neutral' => 'sibling'
                ]
            ]
        ]
        ,'cousin' => [
            'InverseRelationship' => [
                'Label' => [
                    'Male' => 'cousin'
                    ,'Female' => 'cousin'
                    ,'Neutral' => 'cousin'
                ]
            ]
        ]
        ,'coach' => [
            'InverseRelationship' => [
                'Label' => [
                    'Neutral' => 'trainee'
                ]
            ]
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
        ,'Slot' => [
            'default' => null
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
        ,'PersonSlot' => [
            'fields' => ['PersonID', 'Slot']
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
            if (!empty($options['InverseRelationship']) && is_array($options['InverseRelationship'])) {
                foreach ($options['InverseRelationship']['Label'] AS $gender => $relationship) {
                    $templates[$relationship] = [
                        'Relationship' => [
                            'Label' => $relationship
                        ],
                        'InverseRelationship' => [
                            'Label' => static::getInverseRelationships($relationship)
                        ]
                    ];

                    if (!empty($options['Relationship']) && !empty($options['Relationship']['Class'])) {
                        $templates[$relationship]['InverseRelationship']['Class'] = $options['Relationship']['Class'];
                    }

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
            $relationshipGender = !empty($relationshipData['Person']['Gender'])
                ? $relationshipData['Person']['Gender']
                : 'Neutral';

            if (!empty($relationshipData['InverseRelationship'])
                && in_array($relationship, $relationshipData['InverseRelationship']['Label'])
            ) {
                $relationships[$relationshipGender] = $relationshipName;
            }
        }

        return $relationships;
    }
}