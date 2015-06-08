<?php 

namespace Slate\Progress\Interims;

use Slate\Term;
use Slate\People\Student;
use Emergence\People\Person;
use Emergence\People\Relationship;

class ReportsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    static public $recordClass = Report::class;
	static public $accountLevelBrowse = 'Staff';
	static public $accountLevelRead = 'Staff';
	static public $accountLevelWrite = 'Staff';
	static public $accountLevelAPI = 'Staff';
	static public $pdfTemplate = 'interims/print';
	
	static public function handleRequest()
	{
		// save static class
		static::$calledClass = get_called_class();

		switch(static::peekPath())
		{
			case 'pdf':
			case 'json':
				static::$responseMode = static::shiftPath();
				break;
		}

		return static::handleRecordsRequest();
	}
	
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
				return static::handleAllReportsRequest();
			}
    		
			case 'print':
			{
				return static::handlePrintRequest();
			}
    		
			case 'csv':
			{
				return static::handleCsvRequest();
			}
			
			case 'email':
			{
				return static::handleEmailRequest();
			}

			case 'singleEmailPreview':
			{
				return static::handleSingleEmailPreviewRequest();
			}
			
			default:
			{
				return parent::handleRecordsRequest($action);
			}
		}
	}
	
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
		
	
		return static::respond('interimReports', array(
			'success' => true
			,'term' => $Term
			,'data' => Report::getAllByQuery(
				'SELECT'
				.' Existing.ID AS ID'
				.' ,"Slate\\\\Progress\\\\Interims\\\\Report" AS Class'
				.' ,IFNULL(Existing.Created,0) AS Created'
				.' ,IFNULL(Existing.CreatorID,%1$u) AS CreatorID'
				.' ,StudentPart.PersonID AS StudentID'
				.' ,StudentPart.CourseSectionID AS CourseSectionID'
				.' ,%2$u AS TermID'
				.' ,IFNULL(Existing.Status,"Phantom") AS Status'
				.' ,Existing.Grade AS Grade'
				.' ,Existing.Comments AS Comments'
                .' ,Existing.Saved AS Saved'
				.' FROM course_section_participants StudentPart'
				.' LEFT JOIN people Student ON (Student.ID = StudentPart.PersonID)'
				.' LEFT JOIN interim_reports Existing ON (Existing.StudentID = StudentPart.PersonID AND Existing.CourseSectionID = StudentPart.CourseSectionID AND TermID = %2$u)'
				.' WHERE StudentPart.CourseSectionID IN'
				.'   ('
				.'     SELECT CourseSectionID'
				.'     FROM course_section_participants InstructorPart'
				.'     LEFT JOIN course_sections InstructorSection ON (InstructorSection.ID = InstructorPart.CourseSectionID)'
				.'     WHERE InstructorPart.PersonID = %1$u AND InstructorPart.Role = "Teacher" AND InstructorSection.TermID IN (%3$s)'
				.'   )'
				.'   AND StudentPart.Role = "Student"'
                .' ORDER BY CourseSectionID, Student.LastName, Student.FirstName'
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
		
		$searchQuery = '';
		if($_REQUEST['query'])
		{
			$searchQuery = 'WHERE Person.FirstName LIKE "%'.$_REQUEST['query'].'%" OR Person.LastName LIKE "%'.$_REQUEST['query'].'%"';
		}
		
		return static::respond('interimAuthors', array(
			'success' => true
			,'data' => Person::getAllByQuery(
				'SELECT Person.* FROM (SELECT DISTINCT CreatorID FROM `%s`) AS Author LEFT JOIN `%s` Person ON (Person.ID = Author.CreatorID) %s ORDER BY Person.LastName, Person.FirstName'
				,array(
					Report::$tableName
					,Person::$tableName
					,$searchQuery
				)
			)
		));
	}

	static public function handleAllReportsRequest()
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
	
		return static::respond('interimReports', array(
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
		
		$filename = 'Interim Reports';
		
		$where = array(
			'TermID = '.$Term->ID
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
            
            if(!empty($_REQUEST['downloadToken']))
            {
                setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
            }
	
			header('Content-Type: application/pdf');
			header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
			readfile($filePath.'.pdf');
			exit();
		}
	}
	
	static public function handleEmailRequest()
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

		$filename = 'Interim Reports';
		$query = array(
			'TermID='.$Term->ID
		);
		$params = array(
			'TermID' => $Term->ID		
		);
		$relationships = array(
			'Father'
			,'Mother'
			,'Foster Father'
			, 'Foster Mother'
			,'Guardian'
		);
		$emails = array();
		
		$studentInterims = array();
		
		if(!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID']))
		{
			$query[] = 'CourseSectionID='.$_REQUEST['sectionID'];
			$params['CourseSectionID'] =  $_REQUEST['sectionID'];
		}
	
		if(!empty($_REQUEST['advisorID']) && is_numeric($_REQUEST['advisorID']) && ($Advisor = Person::getByID($_REQUEST['advisorID'])))
		{
			$query[] = 'StudentID IN (SELECT Student.ID FROM people Student WHERE Student.AdvisorID = '.$_REQUEST['advisorID'].')';
		}
	
		if(!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID'])))
		{
			$query[] = 'CreatorID='.$_REQUEST['authorID'];
			$params['CreatorID'] = $_REQUEST['authorID'];
		}
	
		if(!empty($_REQUEST['studentID']) && is_numeric($_REQUEST['studentID']) && ($Student = Person::getByID($_REQUEST['studentID'])))
		{
			$query[] = 'StudentID='.$_REQUEST['studentID'];
			$filename .= ' - '.$Student->Username;

		}
		
		$students = \DB::allRecords('SELECT DISTINCT(StudentID) FROM `%s` WHERE '.implode(' AND ', $query), array(
			Report::$tableName	
		));
		
		$recipientGroups = explode(',' , $_REQUEST['Recipients']);
		
		if(!$students)
			return false;
			
		for($i=0; $i < count($students); $i++)
		{
			$emails[$i]['Student'] = Student::getByID($students[$i]['StudentID']);
			
			$Student = $emails[$i]['Student'];
			
			$recipients = array();			
			$recipients[] = $Student->EmailRecipient;
			
			foreach($recipientGroups as $recipientGroup)
			{
				switch($recipientGroup)
				{
					case 'Advisor':
					{
						if($Student->Advisor) {
							$recipients[] = $Student->Advisor->EmailRecipient;
						}
						break;
					}
					
					case 'Parents':
					{
						$guardianRelationships = Relationship::getAllByWhere(array(
							'PersonID' => $Student->ID
							,'Label IN ("'.implode('","', $relationships).'")'
						));
							
						foreach($guardianRelationships as $guardianRelationship)
						{
							$relatedPerson = $guardianRelationship->RelatedPerson;
							if($relatedPerson->PrimaryEmailID && \Validators::email($relatedPerson->Email))
							{
								$recipients[] = $relatedPerson->EmailRecipient;
							}

						}
						break;
					}
				}
			}
			
			$emails[$i]['Recipients'] = $recipients;
		}
	
		$Session->requireAccountLevel('Administrator');
		if(!$_REQUEST['sendEmails'])
		{
			\JSON::translateAndRespond(array(
				'data' => $emails	
			));	
		}
		
		foreach($emails as $email)
		{
			$Student = $email['Student'];
			$params['StudentID'] = $Student->ID;	
			$subject = sprintf('Interim Report for %s, %s', $Student->FullName, $Term->getFuzzyTitle());
			$recipients = $email['Recipients'];
			
			$studentInterims  = Report::getAllByWhere($params);
			
			$html = \TemplateResponse::getSource('email', array(
				'data' => $studentInterims
				,'Student' => $Student
				,'Term' => $Term
			));
			
			\Emergence\Mailer\PHPMailer::send($recipients, $subject, $html, 'no-reply@scienceleadership.org');
			
#			$logString = implode(',',$recipients) . '/' . $subject . '/' . $html . "\n\n\n";
#			MICS::dump($logString);
#			file_put_contents('/emergence/sites/slate-staging/logs/interim-email.log', $logString, FILE_APPEND);
		}
	}
	
	static public function handleSingleEmailPreviewRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');
		$Student = Student::getByID($_REQUEST['studentID']);
		
		if(empty($_REQUEST['termID']) || !is_numeric($_REQUEST['termID']))
		{
			$Term = Term::getCurrent();
		}
		elseif(!$Term = Term::getByID($_REQUEST['termID']))
		{
			return static::throwNotFoundError('Term not found');
		}
		
		$params = array(
			'TermID' => $Term->ID
			,'StudentID' => $_REQUEST['studentID']
		);
		
		if(!empty($_REQUEST['sectionID']) && is_numeric($_REQUEST['sectionID']))
		{
			$params['CourseSectionID'] =  $_REQUEST['sectionID'];
		}
	
		if(!empty($_REQUEST['authorID']) && is_numeric($_REQUEST['authorID']) && ($Author = Person::getByID($_REQUEST['authorID'])))
		{
			$params['CreatorID'] = $_REQUEST['authorID'];
		}
		
		$interims = Report::getAllByWhere($params);
		
		$html = \TemplateResponse::getSource('email', array(
			'data' => $interims
			,'Student' => $Student
			,'Term' => $Term
		));
		
		die($html);	
	}
	
    static public function handleCsvRequest()
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
		
		$filename = 'Interim Reports';
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
        
        if(!empty($_REQUEST['downloadToken']))
        {
            setcookie('downloadToken', $_REQUEST['downloadToken'], time()+300, '/');
        }
        
        $filename .= ' ('.date('Y-m-d').')';
	
        $sw = new \SpreadsheetWriter(array(
			'filename' => $filename
            ,'autoHeader' => true
		));
        
        $reports = Report::getAllByWhere($where, array(
			'order' => '(SELECT CONCAT(LastName,FirstName) FROM people WHERE people.ID = StudentID)'
			,'limit' => (!empty($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) ? $_REQUEST['limit'] : false
		));
        
        foreach($reports AS $Report)
        {
            $sw->writeRow(array(
            	'Grad. Year' => $Report->Student->GraduationYear
            	,'Advisor' => $Report->Student->Advisor->Username
                ,'Last name' => $Report->Student->LastName
                ,'First name' => $Report->Student->FirstName
                ,'Student ID' => $Report->Student->StudentNumber
                ,'Course' => $Report->Section->Course->Title
                ,'Section' => $Report->Section->Code
                ,'Instructor' => $Report->Section->Instructors[0]->Username
                ,'Grade' => $Report->Grade
            ));
        }
        
        $sw->close();
	}
	
	static public function respond($responseID, $responseData = array(), $responseMode = false)
	{
		$className = static::$recordClass;
		$responseMode = !$responseMode ? static::$responseMode : $responseMode;
		
		if($responseMode == 'pdf')
		{
			$html = \TemplateResponse::getSource(static::$pdfTemplate, $responseData);
			if($_REQUEST['export'])
			{
				$filename .= ' ('.date('Y-m-d').')';
				$filePath = tempnam('/tmp', 'slate_nr_');
		
				file_put_contents($filePath.'.html', $html);
				$command = "/usr/local/bin/wkhtmltopdf \"$filePath.html\" \"$filePath.pdf\"";
				
				exec($command);
            	
            	$tokenName = 'downloadToken';
	            if(!empty($_REQUEST[$tokenName]))
	            {
	                setcookie($tokenName, $_REQUEST[$tokenName], time()+300, '/');
	            }
	            
	            header('Content-Type: application/pdf');
				header("Content-Disposition: attachment; filename=\"$filename.pdf\"");
				readfile($filePath.'.pdf');
				exit();
			}
			else
			{
				die($html);
			}	
		}
	
		return parent::respond($responseID, $responseData);
	}
	
}