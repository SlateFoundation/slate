<?php

Emergence\People\Person::$relationships['CurrentCourseSections'] = array(
    'type' => 'many-many'
    ,'class' => Slate\Courses\Section::class
    ,'linkClass' => Slate\Courses\SectionParticipant::class
    ,'linkLocal' => 'PersonID'
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

Emergence\People\Person::$relationships['Mappings'] = array(
    'type' => 'context-children'
    ,'class' => Emergence\Connectors\Mapping::class
    ,'contextClass' => Emergence\People\Person::getStaticRootClass()
);

Emergence\People\Person::$searchConditions['Course'] = array(
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

Emergence\People\Person::$searchConditions['Advisor'] = array(
    'qualifiers' => array('advisor')
    ,'points' => 1
    ,'callback' => function($username, $matchedCondition) {
        if (!$Advisor = Emergence\People\User::getByUsername($username)) {
            return false;
        }

        if (!$currentTerm = Slate\Term::getClosest()) {
            return false;
        }

        return sprintf(
            'GraduationYear >= %u AND AdvisorID = %u'
            , date('Y', strtotime($currentTerm->getMaster()->EndDate))
            , $Advisor->ID
        );
    }
);

Emergence\People\Person::$searchConditions['WardAdvisor'] = array(
    'qualifiers' => array('ward-advisor')
    ,'points' => 1
    ,'callback' => function($username, $matchedCondition) {
        if (!$Advisor = Emergence\People\User::getByUsername($username)) {
            return false;
        }

        if (!$currentTerm = Slate\Term::getClosest()) {
            return false;
        }

        return sprintf(
            'ID IN ('
                .'SELECT relationships.RelatedPersonID'
                .' FROM people Student'
                .' RIGHT JOIN relationships'
                    .' ON (relationships.PersonID = Student.ID AND relationships.Class = "Guardian")'
                .' WHERE'
                    .' GraduationYear >= %u'
                    .' AND AdvisorID = %u'
            .')'
            , date('Y', strtotime($currentTerm->getMaster()->EndDate))
            , $Advisor->ID
        );
    }
);