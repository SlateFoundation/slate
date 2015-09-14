<?php

namespace Slate\People;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use ProgressNote, NarrativeReport, InterimReport, StandardsPromptGrade;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

use Slate\Progress\Note;

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
    
    public function getProgressRecords($reportTypes, $params, $summarizeRecords = true,  $search = false)
    {
        $records = array();
		
		foreach($reportTypes as $reportType)
		{
			switch($reportType)
			{
				case 'progressnotes':
				{
					$records = $summarizeRecords ? array_merge($records, static::getProgressNotesSummary($params, $search)) : array_merge($records, static::getProgressNotes($params, $search));
					break;
				}
				
			}
		}

		return $records;
	}
	
	static public function getProgressSearchConditions($reportType, $search)
	{

		$reportSearchTerms = array(
			'qualifierConditions' => array()
			,'mode' => 'AND'
		);

		$terms = preg_split('/\s+/', $search);

		foreach($terms AS $term)
		{
			$n = 0;
			$qualifier = 'any';
			$split = explode(':', $term, 2);
			
			if(empty($term))
			{
				continue;
			}
			
			if(count($split) == 2)
			{
				$qualifier = strtolower($split[0]);
				$term = $split[1];
			}
			
			if($qualifier == 'mode' && $term == 'or')
			{
				$reportSearchTerms['mode'] = 'OR';
			}
			
			if($reportType == 'Standards' && $qualifier == 'course')
			{
				return array(
					'qualifierConditions' => array(
						'course' => array(
							'Sections.Handle="'.$term.'"'
						)
					)
					,'mode' => 'AND'
				);
				//Reports will only have course section functionality for now. This is temporary.
			}
			else if($reportType == 'Standards' && $qualifier == 'any')
			{
				continue;
			}
			else if($reportType == 'Standards')
			{
				return array(
					'qualifierConditions' => array()
					,'mode' => 'AND'
				);
			}

			foreach(static::$progressSearchConditions[$reportType] AS $k => $condition)
			{
				if(!in_array($qualifier, $condition['qualifiers']))
					continue;
								
				$sqlCondition = !empty($condition['sql']) ? sprintf($condition['sql'], \DB::escape($term)) : false;
				
				$matchers[] = array(
					'condition' => $sqlCondition
					,'points' => $condition['points']
                    ,'qualifier' => $qualifier
				);
			}
		}
		
		if($matchers)
		{
	        foreach($matchers AS $matcher)
	        {
	        	if(!is_array($reportSearchTerms['qualifierConditions'][$matcher['qualifier']]))
	        	{
	        		$reportSearchTerms['qualifierConditions'][$matcher['qualifier']] = array();
	        	}
	        	
	            $reportSearchTerms['qualifierConditions'][$matcher['qualifier']][] = $matcher['condition'];
	        }
		}
        
        return $reportSearchTerms;
	}
	
	static protected function getProgressNotesSummary($params, $search = false)
	{
		$sql = 'SELECT %s FROM `%s` Note LEFT JOIN `%s` People ON (People.ID = Note.AuthorID)  WHERE (%s) HAVING (%s)';
		
		$having = array();
		$select = array(
			'Note.ID'
			,'Note.Class'
			,'Note.Subject'
			,'Sent AS Date'
			,'People.Username AS AuthorUsername'
		);	
		
		$queryParams = array(
			Note::$tableName
			,Person::$tableName
		);
		
		$termCondition = $params['Term'] == 'All' ? false : 'DATE(Note.Created) BETWEEN "'. $params['Term']->StartDate . '" AND "' . $params['Term']->EndDate . '"';

		$conditions = array(
			'ContextID='.$params['StudentID']
			,'ContextClass="'.\DB::escape(Person::class).'"'
		);
		
		if($termCondition)
		{
			$conditions[] = $termCondition;
		}
		
		if($search)
		{
			$matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
			$searchConditions = array();
				
			if(!empty($matchedSearchConditions['qualifierConditions']))
			{
				foreach($matchedSearchConditions['qualifierConditions'] as $qualifierConditions)
				{
					$conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';
					
					if($matchedSearchConditions['mode'] == 'OR')
					{
						$searchConditions = array_merge($searchConditions, $qualifierConditions);
					}
					else
					{
						$conditions[] = $conditionString;
					}
					
				}
			}
			
			if($matchedSearchConditions['mode'] == 'OR')
			{
				$select[] = implode('+', array_map(function($c) {
	    			return sprintf('IF(%s, %u, 0)', $c, 1);
	    		}, $searchConditions)) . ' AS searchScore';
	    		
	    		$having[] = 'searchScore >= 1';
			}
		}
		
		array_unshift($queryParams, implode(',', $select));		
		$queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
		$queryParams[] = empty($having) ? '1' : join(' AND ', $having);

		$notes = array_map(function($note) {
    	    return $note->_record;
		}, Note::getAllByQuery($sql, $queryParams));
	
		return $notes;
	}
	
	static protected function getProgressNotes($params, $search = false)
	{
		$sql = 'SELECT %s FROM `%s` WHERE (%s) HAVING (%s)';
		
		$having = array();
		$select = array(
			'Class'
			,'Subject'
			,'Sent AS Date'
			,'Message'
			,'AuthorID'
			,'ContextID'
		);
		
		$queryParams = array(
			 Note::$tableName
		);
		
		$termCondition = $params['Term'] == 'All' ? false : 'DATE(Created) BETWEEN "'. $params['Term']->StartDate . '" AND "' . $params['Term']->EndDate . '"';

		$conditions = array(
			'ContextID='.$params['StudentID']
			,'ContextClass="'.\DB::escape(Person::class).'"'
		);
		
		if($termCondition)
		{
			$conditions[] = $termCondition;
		}
		
		if($search)
		{
			$matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
			
			$searchConditions = array();
				
			if(!empty($matchedSearchConditions['qualifierConditions']))
			{
				foreach($matchedSearchConditions['qualifierConditions'] as $qualifierConditions)
				{
					$conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';
					
					if($matchedSearchConditions['mode'] == 'OR')
					{
						$searchConditions = array_merge($searchConditions, $qualifierConditions);
					}
					else
					{
						$conditions[] = $conditionString;
					}
					
				}
			}
			
			if($matchedSearchConditions['mode'] == 'OR')
			{
				$select[] = implode('+', array_map(function($c) {
	    			return sprintf('IF(%s, %u, 0)', $c, 1);
	    		}, $searchConditions)) . ' AS searchScore';
	    		
	    		$having[] = 'searchScore >= 1';
			}
		}
		
		array_unshift($queryParams, implode(',', $select));		
		$queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
		$queryParams[] = empty($having) ? '1' : join(' AND ', $having);

		$notes = array_map(function($note) {
            return $note->_record;
		}, ProgressNote::getAllByQuery($sql, $queryParams));
		
		
		foreach($notes as &$note)
		{
			$Author = Person::getByID($note['AuthorID']);
			$Student = Person::getByID($note['ContextID']);
			
			$note['AuthFullName'] = $Author->FullName;
			$note['AuthEmail'] = $Author->Email;
			$note['StudentFullName'] = $Student->FullName;
		}

		return $notes;
	}
}