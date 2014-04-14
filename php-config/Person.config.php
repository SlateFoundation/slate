<?php

Person::$relationships['CurrentCourseSections'] = array(
	'type' => 'many-many'
	,'class' => 'Slate\\Courses\\Section'
	,'linkClass' => 'Slate\\Courses\\SectionParticipant'
    ,'linkForeign' => 'CourseSectionID'
    ,'conditions' => function($Person) {
        if (!$Term = Slate\Term::getCurrent()) {
            $Term = Slate\Term::getNext();
        }
        
        if (!$Term) {
            return array();
        }
        
        return array(
            '(Link.StartDate IS NULL OR Link.StartDate >= CURRENT_DATE)'
            ,'(Link.EndDate IS NULL OR Link.EndDate <= CURRENT_DATE)'
            ,'Related.TermID IN ('.implode(',', $Term->getConcurrentTermIDs()).')'
        );
    }
);

Person::$searchConditions['Course'] = array(
	'qualifiers' => array('course')
	,'points' => 1
	,'join' => array(
		'className' => 'Slate\\Courses\\SectionParticipant'
		,'aliasName' => 'Participant'
		,'localField' => 'ID'
		,'foreignField' => 'PersonID'
	)
	,'callback' => function($handle, $matchedCondition) {    	
		$searchedCourse = Slate\Courses\Section::getByHandle($handle);
		
		if(!$searchedCourse) {
			return false;
		}
		
		$condition = $matchedCondition['join']['aliasName'].'.CourseSectionID'.' = '.$searchedCourse->ID;
		
		return $condition;
	}
);

