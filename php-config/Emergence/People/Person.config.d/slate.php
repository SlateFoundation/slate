<?php

Emergence\People\Person::$relationships['CurrentCourseSections'] = [
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
            return [];
        }

        return [
            '(Link.StartDate IS NULL OR Link.StartDate >= CURRENT_DATE)'
            ,'(Link.EndDate IS NULL OR Link.EndDate <= CURRENT_DATE)'
            ,'Related.TermID IN ('.implode(',', $Term->getConcurrentTermIDs()).')'
        ];
    }
];

Emergence\People\Person::$relationships['Mappings'] = [
    'type' => 'context-children'
    ,'class' => Emergence\Connectors\Mapping::class
    ,'contextClass' => Emergence\People\Person::getStaticRootClass()
];

Emergence\People\Person::$relationships['Wards'] = array(
    'type' => 'many-many',
    'class' => \Emergence\People\Person::class,
    'linkClass' => \Emergence\People\GuardianRelationship::class,
    'linkLocal' => 'RelatedPersonID',
    'linkForeign' => 'PersonID',
    'conditions' => array('Link.Class = "'.\DB::escape(\Emergence\People\GuardianRelationship::class).'"')
);

Emergence\People\Person::$searchConditions['Course'] = [
    'qualifiers' => ['course']
    ,'points' => 1
    ,'join' => [
        'className' => 'Slate\\Courses\\SectionParticipant'
        ,'aliasName' => 'Participant'
        ,'localField' => 'ID'
        ,'foreignField' => 'PersonID'
    ]
    ,'callback' => function($handle, $matchedCondition) {
        $searchedCourse = Slate\Courses\Section::getByHandle($handle);

        if (!$searchedCourse) {
            return false;
        }

        $condition = $matchedCondition['join']['aliasName'].'.CourseSectionID'.' = '.$searchedCourse->ID;

        return $condition;
    }
];

Emergence\People\Person::$searchConditions['Advisor'] = [
    'qualifiers' => ['advisor']
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
];

Emergence\People\Person::$searchConditions['WardAdvisor'] = [
    'qualifiers' => ['ward-advisor']
    ,'points' => 1
    ,'callback' => function($username, $matchedCondition) {
        if (!$Advisor = Emergence\People\User::getByUsername($username)) {
            return false;
        }

        if (!$currentTerm = Slate\Term::getClosest()) {
            return false;
        }

        $ids = DB::allValues(
            'RelatedPersonID',
            'SELECT RelatedPersonID'
            .' FROM people Student'
            .' RIGHT JOIN `%s` relationships'
                .' ON (relationships.PersonID = Student.ID AND relationships.Class = "%s")'
            .' WHERE'
                .' GraduationYear >= %u'
                .' AND AdvisorID = %u',
            [
                Emergence\People\Relationship::$tableName,
                DB::escape(Emergence\People\GuardianRelationship::class),
                date('Y', strtotime($currentTerm->getMaster()->EndDate)),
                $Advisor->ID
            ]
        );

        return 'Emergence_People_Person.ID IN ('.implode(',', $ids).')';
    }
];


// TODO: merge into base model or replace with standard records method
Emergence\People\Person::$searchConditions['ID'] = [
    'qualifiers' => ['id'],
    'points' => 3,
    'callback' => function($ids, $matchedCondition) {

        $ids = explode(',', $ids);

        foreach ($ids as $id) {
            if (is_numeric($id) && intval($id) > 0) {
                $validIds[] = \DB::escape($id);
            }
        }

        if (!empty($validIds)) {
            return $condition = sprintf('`%s`.ID IN (%s)', Emergence\People\Person::getTableAlias(), join(", ", $validIds));
        } else {
            return false;
        }
    }
];