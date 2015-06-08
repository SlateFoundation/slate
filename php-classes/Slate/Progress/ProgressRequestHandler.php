<?php
namespace Slate\Progress;

use Emergence\People\Person;
use Slate\Term;

class ProgressRequestHandler extends \RequestHandler
{
    
	static public $searchConditions = array(
		'ProgressNote' => array(
			'Subject' => array(
				'qualifiers' => array('any')
				,'sql' => 'Subject LIKE "%%%s%%"'
			)
			,'Message' => array(
				'qualifiers' => array('any')
				,'sql' => 'Message Like "%%%s%%"'
			)
			,'Author' => array(
				'qualifiers' => array('author')
				,'sql' => 'AuthorID = (SELECT Author.ID FROM `people` Author WHERE Author.Username = "%s")'
			)
		)
		,'Narrative' => array(
			'Assessment' => array(
				'qualifiers' => array('any')
				,'sql' => 'Assessment LIKE "%%%s%%"'
			)
			,'Comments' => array(
				'qualifiers' => array('any')
				,'sql' => 'Comments Like "%%%s%%"'
			)
			,'Author' => array(
				'qualifiers' => array('author')
				,'sql' => 'Narrative.CreatorID = (SELECT Author.ID FROM `people` Author WHERE Author.Username = "%s")'
			)
			,'Course' => array(
				'qualifiers' => array('course')
				,'sql' => 'Narrative.CourseSectionID = (SELECT Course.ID FROM `course_sections` Course WHERE Course.Handle = "%s")'
			)
		)
		,'Interim' => array(
			'Comments' => array(
				'qualifiers' => array('any')
				,'sql' => 'Comments Like "%%%s%%"'
			)
			,'Author' => array(
				'qualifiers' => array('author')
				,'sql' => 'Interim.CreatorID = (SELECT Author.ID FROM people Author WHERE Author.Username = "%s")'
			)
			,'Course' => array(
				'qualifiers' => array('course')
				,'sql' => 'Interim.CourseSectionID = (SELECT Course.ID FROM `course_sections` Course WHERE Course.Handle = "%s")'
			)
		)
	);
	static public function handleRequest()
	{
		switch(static::peekPath())
		{
			case 'json':
				static::$responseMode = static::shiftPath();
				break;
		}
		
		return static::handleProgressRequest();
	
	}
	
	static public function handleProgressRequest()
	{
		global $Session;
		
		$Session->requireAccountLevel('Staff');

		if(!$_REQUEST['StudentID'])
		{
			return static::throwError('Must supply Student ID');
		}
		
		$params = array(
			'StudentID' => $_REQUEST['StudentID']
		);
		$summarizeRecords = true;
		
		$Person = Person::getByID($_REQUEST['StudentID']);

		if(!$Person->isA(\Slate\People\Student::class))
		{
			return static::throwError($Person->FullName.' is not a student. Please select a different user');
		}
		
		if((empty($_REQUEST['termID']) && $_REQUEST['termID'] != 0) || !is_numeric($_REQUEST['termID']))
		{
			$params['Term'] = Term::getCurrent();
		}
		elseif($_REQUEST['termID'] == 0)
		{
			$params['Term'] = 'All';
		}
		elseif(!$params['Term'] = Term::getByID($_REQUEST['termID']))
		{
			return static::throwNotFoundError('Term not found');
		}
		
		$reportTypes = is_string($_REQUEST['reportTypes']) ? array($_REQUEST['reportTypes']) : $_REQUEST['reportTypes'];

		if(empty($reportTypes))
		{
			return static::throwError('Must supply report types');
		}
		
		$search = !empty($_REQUEST['q']) ? $_REQUEST['q'] : false;
		
		
		switch(static::peekPath())
		{
			case 'export':
			{
				$summarizeRecords = false;
				break;
			}				
		}
		
		$records = $Person->getProgressRecords($reportTypes, $params, $summarizeRecords, $search);
		
		usort($records, function($r1, $r2){
			return (strtotime($r2['Date']) - strtotime($r1['Date']));
		});
	

		if(!$summarizeRecords)
		{
			$html = \TemplateResponse::getSource('reports/export', array(
				'data' => $records	
			));
	
			$filename .= $Person->FullName.' ('.date('Y-m-d').')';
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
			return static::respond('progress', array(
				'data' => $records	
			));
		}
	}
}