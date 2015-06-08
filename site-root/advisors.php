<?php

global $Session;

if(Site::$pathStack[0] == 'json')
{

	RequestHandler::$responseMode = array_shift(Site::$pathStack);
}

$Session->requireAuthentication();

RequestHandler::respond('advisors', array(
	'success' => true
	,'data' => \Emergence\People\Person::getAllByQuery('SELECT DISTINCT Advisor.* FROM people Student LEFT JOIN people Advisor ON Advisor.ID = Student.AdvisorID WHERE Student.AdvisorID IS NOT NULL AND Advisor.ID IS NOT NULL ORDER BY Advisor.LastName')
));