<?php

namespace Slate\People;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
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
        ,'Advisor' => array(
            'qualifiers' => array('advisor')
            ,'points' => 1
            ,'sql' => 'AdvisorID=(SELECT Advisor.ID FROM people Advisor WHERE Advisor.Username = "%s")'
        )
        ,'WardAdvisor' => array(
            'qualifiers' => array('ward-advisor')
            ,'points' => 1
            ,'sql' => 'ID IN (SELECT relationships.RelatedPersonID FROM people Student RIGHT JOIN relationships ON (relationships.PersonID = Student.ID AND relationships.Class = "Guardian") WHERE AdvisorID=(SELECT Advisor.ID FROM people Advisor WHERE Advisor.Username = "%s"))'
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
    
  
}