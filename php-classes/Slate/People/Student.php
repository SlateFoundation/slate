<?php

namespace Slate\People;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use ProgressNote, NarrativeReport, InterimReport, StandardsPromptGrade;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

class Student extends User
{
    public static $fields = array(
        'StudentNumber' => array(
            'type' => 'string'
            ,'unique' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
        ,'AdvisorID' => array(
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        )
        ,'GraduationYear' => array(
            'type' => 'year'
            ,'notnull' => false
        )
    );

    public static $relationships = array(
        'Advisor' => array(
            'type' => 'one-one'
            ,'class' => 'Person'
            ,'local' => 'AdvisorID'
        )
        ,'Guardians' => array(
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Emergence\\People\\GuardianRelationship'
            ,'linkLocal' => 'PersonID'
            ,'linkForeign' => 'RelatedPersonID'
            ,'conditions' => array('Link.Class = "Guardian"')
        )
        ,'GuardianRelationships' => array(
            'type' => 'one-many'
            ,'class' => 'Emergence\\People\\GuardianRelationship'
            ,'foreign' => 'PersonID'
            ,'conditions' => array('Class' => 'Guardian')
        )
    );

    public static $dynamicFields = array(
        'Advisor' => array(
            'accountLevelEnumerate' => 'Staff'
        )
    );

    public static $searchConditions = array(
        'StudentNumber' => array(
            'qualifiers' => array('any', 'studentnumber')
            ,'points' => 2
            ,'sql' => 'StudentNumber LIKE "%s%%"'
        )
        ,'GraduationYear' => array(
            'qualifiers' => array('graduationyear','year')
            ,'points' => 2
            ,'sql' => 'GraduationYear=%u'
        )
        ,'AdvisorID' => array(
            'qualifiers' => array('advisorid')
            ,'points' => 1
            ,'sql' => 'AdvisorID=%u'
        )
    );

    public static $validators = array(
        'StudentNumber' => array(
            'required' => false
            ,'errorMessage' => 'Unique student identifier missing'
        )
    );

    public static function getByStudentNumber($number)
    {
        return static::getByField('StudentNumber', $number);
    }

    public static function getDistinctAdvisors()
    {
        return Person::getAllByQuery(
            'SELECT DISTINCT Advisor.* FROM `%1$s` Student LEFT JOIN `%1$s` Advisor ON Advisor.ID = Student.AdvisorID WHERE Student.AdvisorID IS NOT NULL AND Advisor.ID IS NOT NULL ORDER BY Advisor.LastName, Advisor.FirstName'
            ,array(
                static::$tableName
            )
        );
    }

    public static function getDistinctGraduationYears()
    {
        return DB::allRecords('SELECT DISTINCT GraduationYear FROM people WHERE GraduationYear IS NOT NULL AND GraduationYear != 0000 ORDER BY GraduationYear ASC');
    }

    public static function getAllByListIdentifier($identifier, $includeDisabled = false)
    {
        if (!$identifier) {
            return array();
        }
        
        $filterResult = function ($people) use ($includeDisabled) {
            return array_values(array_filter($people, function($Person) use ($includeDisabled) {
                return $Person->isA(Student::class) && ($includeDisabled || $Person->AccountLevel != 'Disabled');
            }));
        };

        if ($identifier == 'all') {
            return $filterResult(static::getAllByClass()); // TODO: check if this will find sub-student classes?
        }

        if (preg_match('/^\d+(,\d+)*$/', $identifier)) {
            return $filterResult(static::getAllByWhere('ID IN (' . $identifier . ')'));
        }

        list ($groupType, $groupHandle) = explode(' ', $identifier, 2);

        switch ($groupType) {
            case 'group':
                if (!$Group = Group::getByHandle($groupHandle)) {
                    throw new \Exception('Group not found');
                }

                return $filterResult($Group->getAllPeople());
            case 'section':
                if (!$Section = Section::getByHandle($groupHandle)) {
                    throw new \Exception('Section not found');
                }

                return $filterResult($Section->Students);
            default:
                throw new \Exception('Group type not recognized');
        }
    }
}