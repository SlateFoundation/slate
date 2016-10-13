<?php

namespace Slate\People;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use Emergence\People\GuardianRelationship;
use ProgressNote, NarrativeReport, InterimReport, StandardsPromptGrade;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

use Slate\Progress\Note;

class Student extends User
{
    public static $fields = [
        'StudentNumber' => [
            'type' => 'string'
            ,'unique' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'AdvisorID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'GraduationYear' => [
            'type' => 'year'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Advisor' => [
            'type' => 'one-one'
            ,'class' => Person::class
            ,'local' => 'AdvisorID'
        ]
        ,'Guardians' => [
            'type' => 'many-many'
            ,'class' => Person::class
            ,'linkClass' => GuardianRelationship::class
            ,'linkLocal' => 'PersonID'
            ,'linkForeign' => 'RelatedPersonID'
            ,'conditions' => ['Link.Class = "Emergence\\\\People\\\\GuardianRelationship"']
        ]
        ,'GuardianRelationships' => [
            'type' => 'one-many'
            ,'class' => GuardianRelationship::class
            ,'foreign' => 'PersonID'
            ,'conditions' => ['Class' => GuardianRelationship::class]
        ]
    ];

    public static $dynamicFields = [
        'Advisor' => [
            'accountLevelEnumerate' => 'Staff'
        ]
    ];

    public static $searchConditions = [
        'StudentNumber' => [
            'qualifiers' => ['any', 'studentnumber']
            ,'points' => 2
            ,'sql' => 'StudentNumber LIKE "%s%%"'
        ]
        ,'GraduationYear' => [
            'qualifiers' => ['graduationyear','year']
            ,'points' => 2
            ,'sql' => 'GraduationYear=%u'
        ]
        ,'AdvisorID' => [
            'qualifiers' => ['advisorid']
            ,'points' => 1
            ,'sql' => 'AdvisorID=%u'
        ]
    ];

    public static $validators = [
        'StudentNumber' => [
            'required' => false
            ,'errorMessage' => 'Unique student identifier missing'
        ]
    ];

    public static function getByStudentNumber($number)
    {
        return static::getByField('StudentNumber', $number);
    }

    public static function getDistinctAdvisors()
    {
        return Person::getAllByQuery(
            'SELECT DISTINCT Advisor.* FROM `%1$s` Student LEFT JOIN `%1$s` Advisor ON Advisor.ID = Student.AdvisorID WHERE Student.AdvisorID IS NOT NULL AND Advisor.ID IS NOT NULL ORDER BY Advisor.LastName, Advisor.FirstName'
            ,[
                static::$tableName
            ]
        );
    }

    public static function getDistinctGraduationYears()
    {
        return DB::allRecords('SELECT DISTINCT GraduationYear FROM people WHERE GraduationYear IS NOT NULL AND GraduationYear != 0000 ORDER BY GraduationYear ASC');
    }

    public static function getAllByListIdentifier($identifier, $includeDisabled = false)
    {
        if (!$identifier) {
            return [];
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
            return $filterResult(static::getAllByWhere('ID IN ('.$identifier.')'));
        }

        list($groupType, $groupHandle) = preg_split('/[\s:\-]/', $identifier, 2);

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