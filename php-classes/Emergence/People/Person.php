<?php

namespace Emergence\People;

use DB;
use VersionedRecord;
use Group;

class Person extends VersionedRecord implements \Emergence\People\IPerson
{
    // support subclassing
    public static $rootClass = __CLASS__;
    public static $defaultClass = __CLASS__;
    public static $subClasses = array(__CLASS__);

    // VersionedRecord configuration
    public static $historyTable = 'history_people';

    // ActiveRecord configuration
    public static $tableName = 'people';
    public static $singularNoun = 'person';
    public static $pluralNoun = 'people';
    public static $collectionRoute = '/people';

    public static $fields = array(
        'FirstName' => array(
            'includeInSummary' => true
        )
        ,'LastName' => array(
            'includeInSummary' => true
        )
        ,'MiddleName' => array(
            'notnull' => false
        )
        ,'Gender' => array(
            'type' => 'enum'
            ,'values' => array('Male','Female')
            ,'notnull' => false
        )
        ,'BirthDate' => array(
            'type' => 'date'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
        ,'Location' => array(
            'notnull' => false
        )
        ,'About' => array(
            'type' => 'clob'
            ,'notnull' => false
        )
        ,'PrimaryPhotoID' => array(
            'type' => 'uint'
            ,'notnull' => false
        )
        ,'PrimaryEmailID' => array(
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
        ,'PrimaryPhoneID' => array(
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
        ,'PrimaryPostalID' => array(
            'type' => 'uint'
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
    );

    public static $relationships = array(
        'GroupMemberships' => array(
            'type' => 'one-many'
            ,'class' => 'GroupMember'
            ,'indexField' => 'GroupID'
            ,'foreign' => 'PersonID'
        )
        ,'Notes' => array(
            'type' => 'context-children'
            ,'class' => 'Note'
            ,'contextClass' => 'Person'
            ,'order' => array('ID' => 'DESC')
        )
        ,'Groups' => array(
            'type' => 'many-many'
            ,'class' => 'Group'
            ,'linkClass' => 'GroupMember'
            ,'linkLocal' => 'PersonID'
            ,'linkForeign' => 'GroupID'
        )
        ,'PrimaryPhoto' => array(
            'type' => 'one-one'
            ,'class' => 'PhotoMedia'
            ,'local' => 'PrimaryPhotoID'
        )
        ,'Photos' => array(
            'type' => 'context-children'
            ,'class' => 'PhotoMedia'
            ,'contextClass' => __CLASS__
        )
        ,'Comments' => array(
            'type' => 'context-children'
            ,'class' => 'Comment'
            ,'contextClass' => __CLASS__
            ,'order' => array('ID' => 'DESC')
        )
        ,'PrimaryEmail' => array(
            'type' => 'one-one'
            ,'class' => '\\Emergence\\People\\ContactPoint\\Email'
        )
        ,'PrimaryPhone' => array(
            'type' => 'one-one'
            ,'class' => '\\Emergence\\People\\ContactPoint\\Phone'
        )
        ,'PrimaryPostal' => array(
            'type' => 'one-one'
            ,'class' => '\\Emergence\\People\\ContactPoint\\Postal'
        )
        ,'ContactPoints' => array(
            'type' => 'one-many'
            ,'class' => '\\Emergence\\People\\ContactPoint\\AbstractPoint'
            ,'foreign' => 'PersonID'
        )
        ,'Relationships' => array(
            'type' => 'one-many'
            ,'class' => 'Emergence\\People\\Relationship'
            ,'foreign' => 'PersonID'
        )
    );

    public static $dynamicFields = array(
        'PrimaryEmail' => array(
            'accountLevelEnumerate' => 'Staff'
        )
        ,'PrimaryPhone' => array(
            'accountLevelEnumerate' => 'Staff'
        )
        ,'PrimaryPostal' => array(
            'accountLevelEnumerate' => 'Staff'
        )
        ,'PrimaryPhoto'
        ,'Photos'
        ,'groupIDs' => array(
            'method' => 'getGroupIDs'
        )
    );

    public static $searchConditions = array(
        'FirstName' => array(
            'qualifiers' => array('any','name','fname','firstname','first')
            ,'points' => 2
            ,'sql' => 'FirstName LIKE "%%%s%%"'
        )
        ,'LastName' => array(
            'qualifiers' => array('any','name','lname','lastname','last')
            ,'points' => 2
            ,'sql' => 'LastName LIKE "%%%s%%"'
        )
        ,'Gender' => array(
            'qualifiers' => array('gender','sex')
            ,'points' => 2
            ,'sql' => 'Gender LIKE "%s"'
        )
        ,'Class' => array(
            'qualifiers' => array('class')
            ,'points' => 2
            ,'sql' => 'Class LIKE "%%%s%%"'
        )
        ,'Group' => array(
            'qualifiers' => array('group')
            ,'points' => 1
            ,'join' => array(
                'className' => 'GroupMember'
                ,'aliasName' => 'GroupMember'
                ,'localField' => 'ID'
                ,'foreignField' => 'PersonID'
            )
            ,'callback' => 'getGroupConditions'
        )
        ,'RelatedTo' => array(
            'qualifiers' => array('related-to')
            ,'points' => 1
            ,'sql' => 'ID IN (SELECT IF(RelatedPerson.ID = relationships.RelatedPersonID, relationships.PersonID, relationships.RelatedPersonID) FROM people RelatedPerson RIGHT JOIN relationships ON (RelatedPerson.ID IN (relationships.PersonID, relationships.RelatedPersonID)) WHERE RelatedPerson.Username = "%s")'
        )
        ,'RelatedToID' => array(
            'qualifiers' => array('related-to-id')
            ,'points' => 1
            ,'sql' => 'ID IN (SELECT IF(RelatedPerson.ID = relationships.RelatedPersonID, relationships.PersonID, relationships.RelatedPersonID) FROM people RelatedPerson RIGHT JOIN relationships ON (RelatedPerson.ID IN (relationships.PersonID, relationships.RelatedPersonID)) WHERE RelatedPerson.ID = %u)'
        )
    );

    public static $validators = array(
        'Class' => array(
            'validator' => 'selection'
            ,'choices' => array() // filled dynamically in __classLoaded
            ,'required' => false
        )
        ,'FirstName' => array(
            'minlength' => 2
            ,'required' => true
            ,'errorMessage' => 'First name is required.'
        )
        ,'LastName' => array(
            'minlength' => 2
            ,'required' => true
            ,'errorMessage' => 'Last name is required.'
        )
        ,'BirthDate' => array(
            'validator' => 'date_ymd'
            ,'required' => false
        )
        ,'Gender' => array(
            'validator' => 'selection'
            ,'required' => false
            ,'choices' => array() // filled dynamically in __classLoaded
        )
    );

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
        switch ($name) {
            case 'FullName':
                return $this->getFullName();
            case 'FirstInitial':
                return strtoupper(substr($this->FirstName, 0, 1));
            case 'LastInitial':
                return strtoupper(substr($this->LastName, 0, 1));
            case 'FirstNamePossessive':
                if (substr($this->FirstName, -1) == 's') {
                    return $this->FirstName . '\'';
                } else {
                    return $this->FirstName . '\'s';
                }
            case 'FullNamePossessive':
                $fullName = $this->FullName;

                if (substr($fullName, -1) == 's') {
                    return $fullName . '\'';
                } else {
                    return $fullName . '\'s';
                }
            case 'Email':
                \Emergence\Logger::general_warning('Deprecated: Read on Person(#{PersonID})->Email, use ->PrimaryEmail instead', array('PersonID' => $this->ID));

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
        return $this->FirstName . ' ' . $this->LastName;
    }

    public function setValue($name, $value)
    {
        switch ($name) {
            case 'Email':
                \Emergence\Logger::general_warning('Deprecated: Write on Person(#{PersonID})->Email, use ->PrimaryEmail = Email::fromString(...) instead', array('PersonID' => $this->ID));

                if (!$this->isPhantom) {
                    $Existing = \Emergence\People\ContactPoint\Email::getByString($value, array('PersonID' => $this->ID));
                }

                $this->PrimaryEmail = $Existing ? $Existing : \Emergence\People\ContactPoint\Email::fromString($value, $this, true);
                break;
            default:
                return parent::setValue($name, $value);
        }
    }

    public static function getByEmail($email)
    {
        $EmailPoint = \Emergence\People\ContactPoint\Email::getByString($email);
        return $EmailPoint ? $EmailPoint->Person : null;
    }

    public static function getByFullName($firstName, $lastName)
    {
        return static::getByWhere(array(
            'FirstName' => $firstName
            ,'LastName' => $lastName
        ));
    }

    public static function getOrCreateByFullName($firstName, $lastName, $save = false)
    {
        if ($Person = static::getByFullName($firstName, $lastName)) {
            return $Person;
        } else {
            return static::create(array(
                'FirstName' => $firstName
                ,'LastName' => $lastName
            ), $save);
        }
    }

    public static function parseFullName($fullName)
    {
        $parts = preg_split('/\s+/', trim($fullName), 2);

        if (count($parts) != 2) {
            throw new \Exception('Full name must contain a first and last name separated by a space.');
        }

        return array(
            'FirstName' => $parts[0]
            ,'LastName' => $parts[1]
        );
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
        $group = Group::getByHandle($handle);

        if (!$group) {
            return false;
        }

        $containedGroups = DB::allRecords('SELECT ID FROM %s WHERE `Left` BETWEEN %u AND %u', array(
            Group::$tableName
            ,$group->Left
            ,$group->Right
        ));

        $containedGroups = array_map(function($group) {
            return $group['ID'];
        },$containedGroups);

        $condition = $matchedCondition['join']['aliasName'].'.GroupID'.' IN ('.implode(',',$containedGroups).')';

        return $condition;
    }

    public function getGroupIDs()
    {
        return array_map(function($Group){
            return $Group->ID;
        }, $this->Groups);
    }
}