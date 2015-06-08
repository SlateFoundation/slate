<?php 

namespace Slate\Progress\Narratives;

use \Slate\Term;
use \Emergence\People\Person;

class ReportsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
	static public $recordClass = Report::class;
	static public $accountLevelBrowse = 'Staff';
	static public $accountLevelRead = 'Staff';
	static public $accountLevelWrite = 'Staff';
	static public $accountLevelAPI = 'Staff';
	

	static public function handleRecordsRequest($action = false)
	{
		switch($action ? $action : $action = static::shiftPath())
		{
			case 'authors':
			{
				return static::handleAuthorsRequest();
			}
		
			case 'mystudents':
			{
				return static::handleMyStudentsRequest();
			}
			
			case 'all':
			{
				return static::handleAllNarrativesRequest();
			}
			
			case 'print':
			{
				return static::handlePrintRequest();
			}
			
			default:
			{
				return parent::handleRecordsRequest($action);
			}
		}
	}
	
#	static public function handleBrowseRequest()
#	{
#		return static::respond('narrativesConsole');
#	}

	static public function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
	{
				
		if(!empty($_REQUEST['termID']))
		{
			$term = Term::getByWhere(array('ID' => $_REQUEST['termID']));
			//MICS::dump($term, 'this',true);
			$concurrentTerms = $term->getConcurrentTermIDs();
			$containedTerms = $term->getContainedTermIDs();
			$termIDs = array_unique(array_merge($concurrentTerms, $containedTerms));
			
			$conditions[] = sprintf('TermID IN (%s)',join(',',$termIDs));
		}
		
	
		return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
	}
	
#	static protected function onBeforeRecordSaved($Narrative, $datum)
#	{
#		
#	}
	
	static public function handleMyStudentsRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');
		
		if(empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID']))
		{
			$Term = Term::getCurrent();
		}
		elseif(!$Term = Term::getByID($_REQUEST['termID']))
		{
			return static::throwNotFoundError('Term not found');
		}
		//TODO: refactor to inculde tableNames and Class in condition array
		$reportQuery = 'SELECT'
			.' Existing.ID AS ID'
			.' ,"Slate\\\\Progress\\\\Narratives\\\\Report" AS Class'
			.' ,IFNULL(Existing.Created,CURRENT_TIMESTAMP) AS Created'
			.' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
			.' ,StudentPart.PersonID AS StudentID'
			.' ,StudentPart.CourseSectionID AS CourseSectionID'
			.' ,%2$u AS TermID'
			.' ,IFNULL(Existing.Status,"Phantom") AS Status'
			.' ,Existing.Grade AS Grade'
			.' ,Existing.Assessment AS Assessment'
			.' ,Existing.Comments AS Comments'
			.' FROM course_section_participants StudentPart'
			.' LEFT JOIN people Student ON (Student.ID = StudentPart.PersonID)'
			.' LEFT JOIN narrative_reports Existing ON (Existing.StudentID = StudentPart.PersonID AND Existing.CourseSectionID = StudentPart.CourseSectionID AND TermID = %2$u)'
			.' WHERE StudentPart.CourseSectionID IN';
		
		if(!empty($_REQUEST['courseSectionID']))
		{
			$reportQuery .= '('.$_REQUEST['courseSectionID'].')';
		}
		else
		{
			$reportQuery .= '('
				.'     SELECT CourseSectionID'
				.'     FROM course_section_participants InstructorPart'
				.'     LEFT JOIN course_sections InstructorSection ON (InstructorSection.ID = InstructorPart.CourseSectionID)'
				.'     WHERE InstructorPart.PersonID = %1$u AND InstructorPart.Role = "Instructor" AND InstructorSection.TermID IN (%3$s)'
				.'   )';
		}
	
		$reportQuery .= '   AND StudentPart.Role = "Student"';
	
	
	
		return static::respond('narrativeReports', array(
			'success' => true
			,'term' => $Term
			,'data' => Report::getAllByQuery(
				$reportQuery
				,array(
					$Session->PersonID
					,$Term->ID
					,join(',', $Term->getConcurrentTermIDs())
				)
			)
		));
	}

	static public function handleAuthorsRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');
		
		return static::respond('narrativeAuthors', array(
			'success' => true
			,'data' => Person::getAllByQuery(
				'SELECT Person.* FROM (SELECT DISTINCT CreatorID FROM `%s`) AS Author LEFT JOIN `%s` Person ON (Person.ID = Author.CreatorID) ORDER BY Person.LastName, Person.FirstName'
				,array(
					Report::$tableName
					,Person::$tableName
				)
			)
		));
	}

	static public function handleAllNarrativesRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');
		
		if(empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID']))
		{
			$Term = Term::getCurrent();
		}
		elseif(!$Term = Term::getByID($_REQUEST['termID']))
		{
			return static::throwNotFoundError('Term not found');
		}
	
		return static::respond('narrativeReports', array(
			'success' => true
			,'term' => $Term
			,'data' => Report::getAllByWhere(array(
				'TermID' => $Term->ID
			))
		));
	}

	static public function handlePrintRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');
		
		if(empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID']))
		{
			$Term = Term::getCurrent();
		}
		elseif(!$Term = Term::getByID($_REQUEST['termID']))
		{
			return static::throwNotFoundError('Term not found');
		}
		
		$filename = 'Narrative Reports';
		$where = array(
			'TermID' => $Term->ID
		);
		
		if(!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID']))
		{
			$where['CourseSectionID'] = $_REQUEST['sectionID'];
		}
	
		if(!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID'])))
		{
			$where[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
			$filename .= ' - '.$Advisor->LastName;
		}
	
		if(!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID'])))
		{
			$where[] = 'CreatorID = '.$_REQUEST['authorID'];
			$filename .= ' - by '.$Author->Username;
		}
	
		if(!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID'])))
		{
			$where['StudentID'] = $_REQUEST['studentID'];
			$filename .= ' - '.$Student->Username;
		}
	
		$html = \TemplateResponse::getSource('print', array(
			'Term' => $Term
			,'data' => Report::getAllByWhere($where, array(
				'order' => '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)'
				,'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
			))
		));

		if(static::peekPath() == 'preview')
			die($html);

		$filename .= ' ('.date('Y-m-d').')';
		$filePath = tempnam('/tmp', 'slate_nr_');
		
		file_put_contents($filePath.'.html', $html);
		$command = "/usr/local/bin/wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";
		
		
		if(static::peekPath() == 'stage')
		{
			die($command);
		}
		else
		{
			exec($command);
	
			header('Content-Type: application/pdf');
			header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
			readfile($filePath.'.pdf');
			exit();
		}
	}

	
}