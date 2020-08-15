<?php

namespace Emergence\People;

use DB;
use VersionedRecord;
use PhotoMedia;
use Exception;

use Emergence\Comments\Comment;
use Emergence\CRM\Message;
use Emergence\Connectors\Mapping;

class Person extends VersionedRecord implements IPerson
{
    public static $classLabel = 'Person / Contact';

    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = [__CLASS__];

    // VersionedRecord configuration
    public static $historyTable = 'history_people';

    // ActiveRecord configuration
    public static $tableName = 'people';
    public static $singularNoun = 'person';
    public static $pluralNoun = 'people';
    public static $collectionRoute = '/people';

    public static $fields = [
        'FirstName' => [
            'includeInSummary' => true
        ]
        ,'LastName' => [
            'includeInSummary' => true
        ]
        ,'MiddleName' => [
            'notnull' => false
        ]
        ,'PreferredName' => [
            'default' => null
        ]
        ,'NameSuffix' => [
            'default' => null
        ]
        ,'Gender' => [
            'type' => 'enum'
            ,'values' => ['Male','Female']
            ,'notnull' => false
        ]
        ,'BirthDate' => [
            'type' => 'date'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'Location' => [
            'notnull' => false
        ]
        ,'About' => [
            'type' => 'clob'
            ,'notnull' => false
        ]
        ,'PrimaryPhotoID' => [
            'type' => 'uint'
            ,'notnull' => false
        ]
        ,'PrimaryEmailID' => [
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'PrimaryPhoneID' => [
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'PrimaryPostalID' => [
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
    ];

    public static $relationships = [
        'GroupMemberships' => [
            'type' => 'one-many'
            ,'class' => Groups\GroupMember::class
            ,'indexField' => 'GroupID'
            ,'foreign' => 'PersonID'
            ,'prune' => 'delete'
        ]
        ,'Notes' => [
            'type' => 'context-children'
            ,'class' => Message::class
            ,'contextClass' => Person::class
            ,'order' => ['ID' => 'DESC']
        ]
        ,'Groups' => [
            'type' => 'many-many'
            ,'class' => Groups\Group::class
            ,'linkClass' => Groups\GroupMember::class
            ,'linkLocal' => 'PersonID'
            ,'linkForeign' => 'GroupID'
        ]
        ,'PrimaryPhoto' => [
            'type' => 'one-one'
            ,'class' => PhotoMedia::class
            ,'local' => 'PrimaryPhotoID'
        ]
        ,'Photos' => [
            'type' => 'context-children'
            ,'class' => PhotoMedia::class
            ,'contextClass' => __CLASS__
        ]
        ,'Comments' => [
            'type' => 'context-children'
            ,'class' => Comment::class
            ,'contextClass' => __CLASS__
            ,'order' => ['ID' => 'DESC']
        ]
        ,'PrimaryEmail' => [
            'type' => 'one-one'
            ,'class' => ContactPoint\Email::class
        ]
        ,'PrimaryPhone' => [
            'type' => 'one-one'
            ,'class' => ContactPoint\Phone::class
        ]
        ,'PrimaryPostal' => [
            'type' => 'one-one'
            ,'class' => ContactPoint\Postal::class
        ]
        ,'ContactPoints' => [
            'type' => 'one-many'
            ,'class' => ContactPoint\AbstractPoint::class
            ,'foreign' => 'PersonID'
        ]
        ,'Relationships' => [
            'type' => 'one-many'
            ,'class' => Relationship::class
            ,'foreign' => 'PersonID'
        ]
        ,'Mapping' => [
            'type' => 'context-children'
            ,'class' => Mapping::class
            ,'contextClass' => __CLASS__
        ]
    ];

    public static $dynamicFields = [
        'PrimaryEmail' => [
            'accountLevelEnumerate' => 'Staff'
        ]
        ,'PrimaryPhone' => [
            'accountLevelEnumerate' => 'Staff'
        ]
        ,'PrimaryPostal' => [
            'accountLevelEnumerate' => 'Staff'
        ]
        ,'PrimaryPhoto'
        ,'Photos'
        ,'groupIDs' => [
            'method' => 'getGroupIDs'
        ]
    ];

    public static $searchConditions = [
        'FirstName' => [
            'qualifiers' => ['any','name','fname','firstname','first']
            ,'points' => 2
            ,'sql' => 'FirstName LIKE "%%%s%%"'
        ]
        ,'LastName' => [
            'qualifiers' => ['any','name','lname','lastname','last']
            ,'points' => 2
            ,'sql' => 'LastName LIKE "%%%s%%"'
        ]
        ,'Gender' => [
            'qualifiers' => ['gender','sex']
            ,'points' => 2
            ,'sql' => 'Gender LIKE "%s"'
        ]
        ,'Group' => [
            'qualifiers' => ['group']
            ,'points' => 1
            ,'join' => [
                'className' => Groups\GroupMember::class
                ,'aliasName' => 'GroupMember'
                ,'localField' => 'ID'
                ,'foreignField' => 'PersonID'
            ]
            ,'callback' => 'getGroupConditions'
        ]
        ,'RelatedTo' => [
            'qualifiers' => ['related-to']
            ,'points' => 1
            ,'callback' => 'getRelatedToConditions'
            ,'valueType' => 'username'
        ]
        ,'RelatedToID' => [
            'qualifiers' => ['related-to-id']
            ,'points' => 1
            ,'callback' => 'getRelatedToConditions'
            ,'valueType' => 'id'
        ]
    ];

    public static $validators = [
        'Class' => [
            'validator' => 'selection'
            ,'choices' => [] // filled dynamically in __classLoaded
            ,'required' => false
        ]
        ,'FirstName' => [
            'minlength' => 2
            ,'required' => true
            ,'errorMessage' => 'First name is required.'
        ]
        ,'LastName' => [
            'minlength' => 2
            ,'required' => true
            ,'errorMessage' => 'Last name is required.'
        ]
        ,'BirthDate' => [
            'validator' => 'date_ymd'
            ,'required' => false
        ]
        ,'Gender' => [
            'validator' => 'selection'
            ,'required' => false
            ,'choices' => [] // filled dynamically in __classLoaded
        ]
    ];

    // Person
    public static function __classLoaded()
    {
        if (get_called_class() == __CLASS__) {
            self::$validators['Gender']['choices'] = self::$fields['Gender']['values'];
        }

        self::$validators['Class']['choices'] = static::getStaticSubClasses();

        parent::__classLoaded();
    }

    public function getValue($name)
    {
        $rsquo = "\xe2\x80\x99";
        switch ($name) {
            case 'FullName':
                return $this->getFullName();
            case 'PreferredFullName':
                return $this->getPreferredFullName();
            case 'FirstInitial':
                return strtoupper(substr($this->FirstName, 0, 1));
            case 'LastInitial':
                return strtoupper(substr($this->LastName, 0, 1));
            case 'FirstNamePossessive':
                if (substr($this->FirstName, -1) == 's') {
                    return $this->FirstName.$rsquo;
                } else {
                    return $this->FirstName.$rsquo.'s';
                }
            case 'FullNamePossessive':
                $fullName = $this->FullName;

                if (substr($fullName, -1) == 's') {
                    return $fullName.$rsquo;
                } else {
                    return $fullName.$rsquo.'s';
                }
            case 'Email':
                \Emergence\Logger::general_warning('Deprecated: Read on Person(#{PersonID})->Email, use ->PrimaryEmail instead', ['PersonID' => $this->ID]);

                return $this->PrimaryEmail ? (string)$this->PrimaryEmail : null;
            case 'EmailRecipient':
                return $this->PrimaryEmail ? sprintf('"%s" <%s>', $this->FullName, $this->PrimaryEmail) : null;
            default:
                return parent::getValue($name);
        }
    }

    public function getTitle()
    {
        return $this->getFullName();
    }

    public function getFullName()
    {
        return $this->FirstName.' '.$this->LastName;
    }

    public function getPreferredFullName()
    {
        return ($this->PreferredName ?: $this->FirstName).' '.$this->LastName;
    }

    protected static function _relationshipExists($relationship)
    {
        if ($relationship == 'Email') {
            return true;
        }

        return parent::_relationshipExists($relationship);
    }

    protected function _setRelationshipValue($relationship, $value)
    {
        switch ($relationship) {
            case 'Email':
                \Emergence\Logger::general_warning('Deprecated: Write on Person(#{PersonID})->Email, use ->PrimaryEmail = Email::fromString(...) instead', ['PersonID' => $this->ID]);

                if (!$value) {
                    $this->PrimaryEmail = null;
                    break;
                }

                $Existing = $this->isPhantom ? ContactPoint\Email::getByString($value, ['PersonID' => $this->ID]) : null;

                $this->PrimaryEmail = $Existing ? $Existing : ContactPoint\Email::fromString($value, $this);
                break;
            default:
                return parent::_setRelationshipValue($relationship, $value);
        }
    }

    public static function getByEmail($email)
    {
        $EmailPoint = \Emergence\People\ContactPoint\Email::getByString($email);
        return $EmailPoint ? $EmailPoint->Person : null;
    }

    public static function getByFullName($firstName, $lastName, array $conditions = [])
    {
        return static::getByWhere(array_merge([
            'FirstName' => $firstName
            ,'LastName' => $lastName
        ], $conditions));
    }

    public static function getOrCreateByFullName($firstName, $lastName, $save = false)
    {
        if ($Person = static::getByFullName($firstName, $lastName)) {
            return $Person;
        } else {
            return static::create([
                'FirstName' => $firstName
                ,'LastName' => $lastName
            ], $save);
        }
    }

    public static function parseFullName($fullName)
    {
        $parts = preg_split('/\s+/', trim($fullName), 2);

        if (count($parts) != 2) {
            throw new Exception('Full name must contain a first and last name separated by a space.');
        }

        return [
            'FirstName' => $parts[0]
            ,'LastName' => $parts[1]
        ];
    }

    public function validate($deep = true)
    {
        // call parent
        parent::validate($deep);

        // investigate dirty PrimaryEmail/PrimaryEmailID
        if (($this->isFieldDirty('PrimaryEmailID') && $this->PrimaryEmailID) || (!$this->PrimaryEmailID && $this->PrimaryEmail)) {
            // check if repossessing another's email point
            if ($this->PrimaryEmail->PersonID && $this->PrimaryEmail->PersonID != $this->ID) {
                $this->_validator->addError('PrimaryEmailID', 'PrimaryEmail already belongs to another person');
            }
        }

        // investigate dirty PrimaryPhone/PrimaryPhoneID
        if (($this->isFieldDirty('PrimaryPhoneID') && $this->PrimaryPhoneID) || (!$this->PrimaryPhoneID && $this->PrimaryPhone)) {
            // check if repossessing another's email point
            if ($this->PrimaryPhone->PersonID && $this->PrimaryPhone->PersonID != $this->ID) {
                $this->_validator->addError('PrimaryPhoneID', 'PrimaryPhone already belongs to another person');
            }
        }

        // investigate dirty PrimaryPostal/PrimaryPostalID
        if (($this->isFieldDirty('PrimaryPostalID') && $this->PrimaryPostalID) || (!$this->PrimaryPostalID && $this->PrimaryPostal)) {
            // check if repossessing another's email point
            if ($this->PrimaryPostal->PersonID && $this->PrimaryPostal->PersonID != $this->ID) {
                $this->_validator->addError('PrimaryPostalID', 'PrimaryPostal already belongs to another person');
            }
        }

        // save results
        return $this->finishValidation();
    }

    public function save($deep = true)
    {
        parent::save($deep);

        if ($this->isFieldDirty('PrimaryEmailID') && $this->PrimaryEmailID) {
            $this->PrimaryEmail->PersonID = $this->ID;
            $this->PrimaryEmail->save(false);
        }

        if ($this->isFieldDirty('PrimaryPhoneID') && $this->PrimaryPhoneID) {
            $this->PrimaryPhone->PersonID = $this->ID;
            $this->PrimaryPhone->save(false);
        }

        if ($this->isFieldDirty('PrimaryPostalID') && $this->PrimaryPostalID) {
            $this->PrimaryPostal->PersonID = $this->ID;
            $this->PrimaryPostal->save(false);
        }
    }

    public static function getGroupConditions($handle, $matchedCondition)
    {
        $group = Groups\Group::getByHandle($handle);

        if (!$group) {
            return 'FALSE';
        }

        $containedGroups = DB::allRecords('SELECT ID FROM %s WHERE `Left` BETWEEN %u AND %u', [
            Groups\Group::$tableName
            ,$group->Left
            ,$group->Right
        ]);

        $containedGroups = array_map(function($group) {
            return $group['ID'];
        },$containedGroups);

        $condition = $matchedCondition['join']['aliasName'].'.GroupID'.' IN ('.implode(',',$containedGroups).')';

        return $condition;
    }

    public static function getRelatedToConditions($identifier, $matchedCondition)
    {
        if ($matchedCondition['valueType'] == 'id') {
            $Person = static::getById($identifier);
        } elseif ($matchedCondition['valueType'] == 'username') {
            $Person = User::getByUsername($identifier);
        } else {
            throw new Exception('Invalid valueType');
        }

        if (!$Person) {
            return 'FALSE';
        }

        $relatedIds = DB::allValues('ID',
            '
                SELECT DISTINCT IF(RelatedPersonID = %2$u, PersonID, RelatedPersonID) AS ID
                  FROM `%1$s`
                 WHERE %2$u IN (PersonID, RelatedPersonID)
            ',[
                Relationship::$tableName, // 1
                $Person->ID // 2
            ]
        );

        if (!count($relatedIds)) {
            return 'FALSE';
        }

        return static::getTableAlias() . '.ID IN (' . implode(',', $relatedIds) . ')';
    }

    public function getGroupIDs()
    {
        return array_map(function($Group) {
            return $Group->ID;
        }, $this->Groups);
    }
}