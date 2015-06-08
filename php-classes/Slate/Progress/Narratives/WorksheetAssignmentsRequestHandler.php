<?php

namespace Slate\Progress\Narratives;


class WorksheetAssignmentsRequestHandler extends \RecordsRequestHandler
{
    static public $recordClass = WorksheetAssignment::class;
	static public $accountLevelBrowse = 'Staff';
	
	static public function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
	{
				
		if(!empty($_REQUEST['termID']))
		{
			$term = \Slate\Term::getByWhere(array('ID' => $_REQUEST['termID']));
			//MICS::dump($term, 'this',true);
			$concurrentTerms = $term->getConcurrentTermIDs();
			$containedTerms = $term->getContainedTermIDs();
			$termIDs = array_unique(array_merge($concurrentTerms, $containedTerms));
			
			$conditions[] = sprintf('TermID IN (%s)',join(',',$termIDs));
		}
		
	
		return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
	}
}