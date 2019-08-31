<?php

namespace Slate\People;

use Exception;
use RangeException;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;


class Student extends User
{
    public static $classLabel = 'Student';

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
        ,'Advisor' => [
            'qualifiers' => ['advisorid', 'advisor']
            ,'callback' => [__CLASS__, 'getAdvisorSearchConditions']
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

        list($groupType, $groupHandle) = array_pad(preg_split('/[\s:>]/', $identifier, 2), 2, null);

        switch ($groupType) {
            case 'organization':
            case 'group':
                if (!$Group = Group::getByHandle($groupHandle)) {
                    throw new RangeException('Group not found');
                }

                return $filterResult($Group->getAllPeople());
            case 'section':

                // parse cohort
                list($groupHandle, $cohort) = array_pad(preg_split('/[\s:>]/', $groupHandle, 2), 2, null);

                if (!$Section = Section::getByHandle($groupHandle)) {
                    throw new RangeException('Section not found');
                }

                return $filterResult(Person::getAllByQuery(
                    '
                        SELECT Person.*
                          FROM `%s` Participant
                          JOIN `%s` Person ON Person.ID = Participant.PersonID
                         WHERE Participant.CourseSectionID = %u
                           AND Participant.Role = "Student"
                           AND %s
                    ',
                    [
                        SectionParticipant::$tableName,
                        Person::$tableName,
                        $Section->ID,
                        $cohort ? sprintf('Cohort = "%s"', DB::escape($cohort)) : 'TRUE'
                    ]
                ));
            default:
                $students = [];

                foreach (preg_split('/\s*[\n,]\s*/', $identifier) as $studentIdentifier) {
                    if (!$User = static::getByUsername($studentIdentifier)) {
                        throw new RangeException('user not found: '.$studentIdentifier);
                    }

                    $students[] = $User;
                }

                return $filterResult($students);
        }
    }

    protected static function getAdvisorSearchConditions($advisor)
    {
        if (!ctype_digit($advisor)) {
            if ($advisor = User::getByUsername($advisor)) {
                $advisor = $advisor->ID;
            } else {
                return false;
            }
        }

        return sprintf('AdvisorID = %u', $advisor);
    }
}