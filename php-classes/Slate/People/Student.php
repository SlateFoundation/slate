<?php

namespace Slate\People;

use DB;
use Emergence\People\Person;
use Emergence\People\User;
use Emergence\People\Groups\Group;
use ProgressNote, NarrativeReport, InterimReport, StandardsPromptGrade;
use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

use Slate\Term;

use Slate\Courses\Section as CourseSection;
use Slate\Courses\SectionParticipant as CourseSectionParticipant;

use Slate\Progress\Note as ProgressNote;

use Slate\Standards\Prompt as StandardsPrompt;
use Slate\Standards\PromptGrade  as StandardsPromptGrade;
use Slate\Standards\WorksheetPrompt  as StandardsWorksheetPrompt;
use Slate\Standards\Worksheet  as StandardsWorksheet;
use Slate\Standards\WorksheetAssignment  as StandardsWorksheetAssignment;

use Slate\Progress\Narratives\Report as NarrativeReport;

use Slate\Progress\Interims\Report as InterimReport;

class Student extends User
{
    public static $fields = [
        'StudentNumber' => [
            'type' => 'string'
            ,'unique' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'AdvisorID' => [
            'type' => 'integer'
            ,'unsigned' => true
            ,'notnull' => false
            ,'accountLevelEnumerate' => 'Staff'
        ]
        ,'GraduationYear' => [
            'type' => 'year'
            ,'notnull' => false
        ]
    ];

    public static $relationships = [
        'Advisor' => [
            'type' => 'one-one'
            ,'class' => 'Person'
            ,'local' => 'AdvisorID'
        ]
        ,'Guardians' => [
            'type' => 'many-many'
            ,'class' => 'Person'
            ,'linkClass' => 'Emergence\\People\\GuardianRelationship'
            ,'linkLocal' => 'PersonID'
            ,'linkForeign' => 'RelatedPersonID'
            ,'conditions' => ['Link.Class = "Guardian"']
        ]
        ,'GuardianRelationships' => [
            'type' => 'one-many'
            ,'class' => 'Emergence\\People\\GuardianRelationship'
            ,'foreign' => 'PersonID'
            ,'conditions' => ['Class' => 'Guardian']
        ]
    ];

    public static $dynamicFields = [
        'Advisor' => [
            'accountLevelEnumerate' => 'Staff'
        ]
    ];

    public static $searchConditions = [
        'StudentNumber' => [
            'qualifiers' => ['any', 'studentnumber']
            ,'points' => 2
            ,'sql' => 'StudentNumber LIKE "%s%%"'
        ]
        ,'GraduationYear' => [
            'qualifiers' => ['graduationyear','year']
            ,'points' => 2
            ,'sql' => 'GraduationYear=%u'
        ]
        ,'AdvisorID' => [
            'qualifiers' => ['advisorid']
            ,'points' => 1
            ,'sql' => 'AdvisorID=%u'
        ]
    ];

    public static $validators = [
        'StudentNumber' => [
            'required' => false
            ,'errorMessage' => 'Unique student identifier missing'
        ]
    ];

    public static function getByStudentNumber($number)
    {
        return static::getByField('StudentNumber', $number);
    }

    public static function getDistinctAdvisors()
    {
        return Person::getAllByQuery(
            'SELECT DISTINCT Advisor.* FROM `%1$s` Student LEFT JOIN `%1$s` Advisor ON Advisor.ID = Student.AdvisorID WHERE Student.AdvisorID IS NOT NULL AND Advisor.ID IS NOT NULL ORDER BY Advisor.LastName, Advisor.FirstName'
            ,[
                static::$tableName
            ]
        );
    }

    public static function getDistinctGraduationYears()
    {
        return DB::allRecords('SELECT DISTINCT GraduationYear FROM people WHERE GraduationYear IS NOT NULL AND GraduationYear != 0000 ORDER BY GraduationYear ASC');
    }

    public static function getAllByListIdentifier($identifier, $includeDisabled = false)
    {
        if (!$identifier) {
            return [];
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
            return $filterResult(static::getAllByWhere('ID IN ('.$identifier.')'));
        }

        list($groupType, $groupHandle) = explode(' ', $identifier, 2);

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
        $records = [];

        foreach ($reportTypes as $reportType) {
            switch ($reportType) {
                case 'progressnotes':
                {
                    $records = $summarizeRecords ? array_merge($records, static::getProgressNotesSummary($params, $search)) : array_merge($records, static::getProgressNotes($params, $search));
                    break;
                }

            }
        }

        return $records;
    }

    public static function getProgressSearchConditions($reportType, $search)
    {
        $reportSearchTerms = [
            'qualifierConditions' => []
            ,'mode' => 'AND'
        ];

        $terms = preg_split('/\s+/', $search);

        foreach ($terms AS $term) {
            $n = 0;
            $qualifier = 'any';
            $split = explode(':', $term, 2);

            if (empty($term)) {
                continue;
            }

            if (count($split) == 2) {
                $qualifier = strtolower($split[0]);
                $term = $split[1];
            }

            if ($qualifier == 'mode' && $term == 'or') {
                $reportSearchTerms['mode'] = 'OR';
            }

            if ($reportType == 'Standards' && $qualifier == 'course') {
                return [
                    'qualifierConditions' => [
                        'course' => [
                            'Sections.Handle="'.$term.'"'
                        ]
                    ]
                    ,'mode' => 'AND'
                ];
                //Reports will only have course section functionality for now. This is temporary.
            } elseif ($reportType == 'Standards' && $qualifier == 'any') {
                continue;
            } elseif ($reportType == 'Standards') {
                return [
                    'qualifierConditions' => []
                    ,'mode' => 'AND'
                ];
            }

            foreach (static::$progressSearchConditions[$reportType] AS $k => $condition) {
                if (!in_array($qualifier, $condition['qualifiers'])) {
                    continue;
                }

                $sqlCondition = !empty($condition['sql']) ? sprintf($condition['sql'], \DB::escape($term)) : false;

                $matchers[] = [
                    'condition' => $sqlCondition
                    ,'points' => $condition['points']
                    ,'qualifier' => $qualifier
                ];
            }
        }

        if ($matchers) {
            foreach ($matchers AS $matcher) {
                if (!is_array($reportSearchTerms['qualifierConditions'][$matcher['qualifier']])) {
                    $reportSearchTerms['qualifierConditions'][$matcher['qualifier']] = [];
                }

                $reportSearchTerms['qualifierConditions'][$matcher['qualifier']][] = $matcher['condition'];
            }
        }

        return $reportSearchTerms;
    }

    protected static function getProgressNotesSummary($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` Note LEFT JOIN `%s` People ON (People.ID = Note.AuthorID)  WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Note.ID'
            ,'Note.Class'
            ,'Note.Subject'
            ,'Sent AS Date'
            ,'People.Username AS AuthorUsername'
        ];

        $queryParams = [
            ProgressNote::$tableName,
            Person::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'DATE(Note.Created) BETWEEN "'.$params['Term']->StartDate.'" AND "'.$params['Term']->EndDate.'"';

        $conditions = [
            'ContextID='.$params['StudentID']
            ,'ContextClass="'.\DB::escape(Person::class).'"'
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);
            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }
                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)).' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $notes = array_map(function($note) {
            return $note->_record;
        }, ProgressNote::getAllByQuery($sql, $queryParams));

        return $notes;
    }

    protected static function getProgressNotes($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Class'
            ,'Subject'
            ,'Sent AS Date'
            ,'Message'
            ,'AuthorID'
            ,'ContextID'
        ];

        $queryParams = [
             Note::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'DATE(Created) BETWEEN "'.$params['Term']->StartDate.'" AND "'.$params['Term']->EndDate.'"';

        $conditions = [
            'ContextID='.$params['StudentID']
            ,'ContextClass="'.\DB::escape(Person::class).'"'
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('ProgressNote', $search);

            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }
                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)).' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $notes = array_map(function($note) {
            return $note->_record;
        }, ProgressNote::getAllByQuery($sql, $queryParams));


        foreach ($notes as &$note) {
            $Author = Person::getByID($note['AuthorID']);
            $Student = Person::getByID($note['ContextID']);

            $note['AuthFullName'] = $Author->FullName;
            $note['AuthEmail'] = $Author->Email;
            $note['StudentFullName'] = $Student->FullName;
        }

        return $notes;
    }

    protected static function getNarrativeReportsSummary($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` Narrative INNER JOIN `%s` Course ON (Course.ID = Narrative.CourseSectionID) LEFT JOIN `%s` People ON (People.ID = Narrative.CreatorID) WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Narrative.ID',
            'Narrative.Class',
            'Grade',
            'Narrative.Created AS Date',
            'Course.Title AS CourseTitle',
            'People.Username AS AuthorUsername'
        ];

        $queryParams = [
            NarrativeReport::$tableName,
            CourseSection::$tableName,
            Person::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'Narrative.TermID IN (' . implode(',', $params['Term']->getContainedTermIDs()) . ')';

        $conditions = [
            'Narrative.StudentID='.$params['StudentID']
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }


        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('Narrative', $search);

            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }

                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)) . ' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $narratives = DB::allRecords($sql, $queryParams);

        $narratives = array_map(function($narrative){
            $narrative['Subject'] = $narrative['CourseTitle'] . ' - ' . $narrative['Grade'];

            return $narrative;
        }, $narratives);

        return $narratives;
    }

    protected static function getNarrativeReports($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` Narrative WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Class',
            'Grade',
            'Created AS Date',
            'StudentID',
            'CourseSectionID',
            'TermID',
            'Assessment',
            'Comments'
        ];

        $queryParams = [
            NarrativeReport::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'Narrative.TermID IN ('.implode(',', $params['Term']->getContainedTermIDs()) . ')';

        $conditions = [
            'Narrative.StudentID='.$params['StudentID']
        ];

        if($termCondition) {
            $conditions[] = $termCondition;
        }

        if($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('Narrative', $search);

            $searchConditions = [];

            if(!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') OR (', $qualifierConditions).') )';

                    if($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }

                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)) . ' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $narratives = DB::allRecords($sql, $queryParams);

        foreach($narratives as &$narrative) {
            $Section = CourseSection::getByID($narrative['CourseSectionID']);
            $Teacher = $Section->Instructors[0];
            $Student = Student::getByID($narrative['StudentID']);
            $Advisor = $Student->Advisor;
            $narrativeTerm = Term::getByID($narrative['TermID']);

            $narrative['TeacherFullName'] = $Teacher->FullName;
            $narrative['TeacherEmail'] = $Teacher->Email;
            $narrative['AdvisorFullName'] = $Advisor ? $Advisor->FullName : '';
            $narrative['AdvisorEmail'] = $Advisor ? $Advisor->Email: '';
            $narrative['StudentFullName'] = $Student->FullName;
            $narrative['TermTitle'] = $narrativeTerm->Title;
            $narrative['SectionTitle'] = $Section->Title;
        }

        return $narratives;
    }

    protected static function getInterimReportsSummary($params, $search = false)
    {
        $sql = 'SELECT %s FROM `%s` Interim INNER JOIN `%s` Course ON (Course.ID = Interim.CourseSectionID) LEFT JOIN `%s` People ON (People.ID = Interim.CreatorID) WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Interim.ID',
            'Interim.Class',
            'Interim.Grade',
            'Interim.Created AS Date',
            'Course.Title AS CourseTitle',
            'People.Username AS AuthorUsername'
        ];

        $queryParams = [
            InterimReport::$tableName
            ,CourseSection::$tableName
            ,Person::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'Interim.TermID IN (' . implode(',', $params['Term']->getContainedTermIDs()) . ')';

        $conditions = [
            'Interim.StudentID='.$params['StudentID']
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('Interim', $search);

            $searchConditions = [];

            if(!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') AND (', $qualifierConditions).') )';

                    if($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }

                }
            }

            if($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)) . ' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', $conditions) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $interims = DB::allRecords($sql, $queryParams);

        $interims = array_map(function($interim){
            $interim['Subject'] = $interim['CourseTitle'] . ' - ' . $interim['Grade'];

            return $interim;
        }, $interims);

        return $interims;
    }

    protected static function getInterimReports($params, $search)
    {
        $sql = 'SELECT %s FROM `%s` Interim WHERE (%s) HAVING (%s)';

        $having = [];
        $select = [
            'Class',
            'Grade',
            'Created AS Date',
            'CourseSectionID',
            'StudentID',
            'TermID',
            'Comments'
        ];

        $queryParams = [
            InterimReport::$tableName
        ];

        $termCondition = $params['Term'] == 'All' ? false : 'Interim.TermID IN (' . implode(',', $params['Term']->getContainedTermIDs()) . ')';

        $conditions = [
            'Interim.StudentID='.$params['StudentID']
        ];

        if ($termCondition) {
            $conditions[] = $termCondition;
        }

        if ($search) {
            $matchedSearchConditions = static::getProgressSearchConditions('Interim', $search);

            $searchConditions = [];

            if (!empty($matchedSearchConditions['qualifierConditions'])) {
                foreach ($matchedSearchConditions['qualifierConditions'] as $qualifierConditions) {
                    $conditionString = '( ('.implode(') AND (', $qualifierConditions).') )';

                    if ($matchedSearchConditions['mode'] == 'OR') {
                        $searchConditions = array_merge($searchConditions, $qualifierConditions);
                    } else {
                        $conditions[] = $conditionString;
                    }

                }
            }

            if ($matchedSearchConditions['mode'] == 'OR') {
                $select[] = implode('+', array_map(function($c) {
                    return sprintf('IF(%s, %u, 0)', $c, 1);
                }, $searchConditions)) . ' AS searchScore';

                $having[] = 'searchScore >= 1';
            }
        }

        array_unshift($queryParams, implode(',', $select));
        $queryParams[] = $conditions ? implode(' AND ', static::mapConditions($conditions)) : '1';
        $queryParams[] = empty($having) ? '1' : join(' AND ', $having);

        $interims = DB::allRecords($sql, $queryParams);

        foreach ($interims as &$interim) {
            $Section = CourseSection::getByID($interim['CourseSectionID']);
            $Teacher = $Section->Instructors[0];
            $Student = Student::getByID($interim['StudentID']);
            $Advisor = $Student->Advisor;
            $interimTerm = Term::getByID($interim['TermID']);

            $interim['TeacherFullName'] = $Teacher->FullName;
            $interim['TeacherEmail'] = $Teacher->Email;
            $interim['AdvisorFullName'] = $Advisor ? $Advisor->FullName : '';
            $interim['AdvisorEmail'] = $Advisor ? $Advisor->Email: '';
            $interim['StudentFullName'] = $Student->FullName;
            $interim['TermTitle'] = $interimTerm->Title;
            $interim['SectionTitle'] = $Section->Title;
        }

        return $interims;
    }

    protected static function getStandardsSummary($params, $search = false)
    {
        $termIDs = $params['Term'] == 'All' ? false : array_unique(array_merge($params['Term']->getContainedTermIDs(), $params['Term']->getConcurrentTermIDs()));
        $termIDString = $termIDs ? join(',', $termIDs) : false;

        $standards = [];
        $courseSectionSql = 'SELECT Sections.* FROM `%s` Participants INNER JOIN `%s` Sections ON (Participants.CourseSectionID = Sections.ID) WHERE (%s)';

        $courseSectionQueryParams = [
            CourseSectionParticipant::$tableName,
            CourseSection::$tableName
        ];

        $courseSectionConditions = [
            'Sections.Status="Live"',
            'Participants.PersonID='.$params['StudentID']
        ];

        if ($termIDString) {
            $courseSectionConditions[] = 'Sections.TermID IN ('.$termIDString.')';
        }

        if ($search) {
            $searchConditions = static::getProgressSearchConditions('Standards', $search);

            if (!empty($searchConditions['qualifierConditions'])) {
                foreach ($searchConditions['qualifierConditions'] as $qualifierCondition) {
                    $courseSectionConditions[] =  '(('.implode(') OR (', $qualifierCondition).'))';
                }
            }
        }

        $courseSectionQueryParams[] = $courseSectionConditions ? implode(' AND ', $courseSectionConditions) : '1';

        $courseSections = CourseSection::getAllByQuery($courseSectionSql, $courseSectionQueryParams);

        foreach ($courseSections as $Section) {
            $worksheetConditions = [
                'CourseSectionID' => $Section->ID
            ];

            if ($termIDString) {
                $worksheetConditions[] = 'TermID IN (' . $termIDString . ')';
            }

            $worksheetAssignments = StandardsWorksheetAssignment::getAllByWhere($worksheetConditions);

            foreach ($worksheetAssignments as $WorksheetAssignment) {
                if ($WorksheetAssignment) {
                    $scoredPrompts = DB::allRecords(
                        'SELECT'.
                        ' Grade.ID AS ID'.
                        ' ,"Standards" AS Class'.
                        ' ,Grade.Created Created'.
                        ' ,WorksheetPrompt.PromptID'.
                        ' ,Grade.Grade'.
                        ' ,People.Username AS AuthorUsername'.
                        ' FROM `standards_worksheet_prompts` WorksheetPrompt'.
                        ' LEFT JOIN `%s` Grade ON (%s Grade.CourseSectionID = %u AND Grade.StudentID = %u AND Grade.PromptID = WorksheetPrompt.PromptID)'.
                        ' LEFT JOIN `%s` People ON (People.ID = Grade.CreatorID)'.
                        ' WHERE WorksheetPrompt.WorksheetID = %u AND Grade.Grade IS NOT NULL'.
                        ' ORDER BY Grade.Created DESC',
                        [
                            StandardsPromptGrade::$tableName,
                            $termIDString ? 'Grade.TermID = ' . $WorksheetAssignment->TermID . ' AND' : '',
                            $WorksheetAssignment->CourseSectionID,
                            $params['StudentID'],
                            Person::$tableName,
                            $WorksheetAssignment->WorksheetID
                        ]
                    );


                    $totalPrompts = DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE WorksheetID = %u', [
                        StandardsWorksheetPrompt::$tableName,
                        $WorksheetAssignment->WorksheetID
                    ]);

                    if (count($scoredPrompts) && count($scoredPrompts) == $totalPrompts) {
                        $studentScore = 0;

                        foreach ($scoredPrompts as $prompt) {
                            $studentScore += $prompt['Grade'] != 'N/A' ? $prompt['Grade'] : 0;
                        }

                        $standard = [
                            'ID' => null,
                            'Date' => $scoredPrompts[0]['Created'],
                            'Class' => 'Standards',
                            'CourseSectionID' => $WorksheetAssignment->CourseSectionID,
                            'TermID' => $WorksheetAssignment->TermID,
                            'StudentID' => $params['StudentID'],
                            'AuthorUsername' => $scoredPrompts[0]['AuthorUsername'],
                            'Subject' => $WorksheetAssignment->CourseSection->Title . ' - ' . $studentScore . '/' . ($totalPrompts * 4) // total possible score on prompts
                        ];

                        $standards[] = $standard;
                    }
                }
            }

        }

        return $standards;
    }

    protected static function getStandards($params, $search = false)
    {
        $termIDs = $params['Term'] == 'All' ? false : array_unique(array_merge($params['Term']->getContainedTermIDs(), $params['Term']->getConcurrentTermIDs()));
        $termIDString = $termIDs ? join(',', $termIDs) : false;

        $standards = [];
        $courseSectionSql = 'SELECT Sections.* FROM `%s` Participants INNER JOIN `%s` Sections ON (Participants.CourseSectionID = Sections.ID) WHERE (%s)';

        $courseSectionQueryParams = [
            CourseSectionParticipant::$tableName,
            CourseSection::$tableName
        ];

        $courseSectionConditions = [
            'Sections.Status="Live"',
            'Participants.PersonID='.$params['StudentID']
        ];

        if ($termIDString) {
            $courseSectionConditions[] = 'Sections.TermID IN ('.$termIDString.')';
        }

        if ($search) {
            $searchConditions = static::getProgressSearchConditions('Standards', $search);

            if (!empty($searchConditions['qualifierConditions'])) {
                foreach ($searchConditions['qualifierConditions'] as $qualifierCondition) {
                    $courseSectionConditions[] =  '(('.implode(') OR (', $qualifierCondition).'))';
                }
            }
        }

        $courseSectionQueryParams[] = $courseSectionConditions ? implode(' AND ', $courseSectionConditions) : '1';

        $courseSections = CourseSection::getAllByQuery($courseSectionSql, $courseSectionQueryParams);

        foreach ($courseSections as $Section) {
            $worksheetConditions = [
                'CourseSectionID' => $Section->ID
            ];

            if ($termIDString) {
                $worksheetConditions[] = 'TermID IN (' . $termIDString . ')';
            }

            $worksheetAssignments = StandardsWorksheetAssignment::getAllByWhere($worksheetConditions);

            foreach ($worksheetAssignments as $WorksheetAssignment) {
                if ($WorksheetAssignment) {
                    $scoredPrompts = DB::allRecords(
                        'SELECT'.
                        ' Grade.ID AS ID,'.
                        ' "Standards" AS Class,'.
                        ' Grade.Created Created,'.
                        ' WorksheetPrompt.PromptID,'.
                        ' Grade.Grade,'.
                        ' Prompt.Prompt AS Prompt,'.
                        ' Grade.TermID AS TermID'.
                        ' FROM `standards_worksheet_prompts` WorksheetPrompt'.
                        ' LEFT JOIN `%s` Grade ON (%s Grade.CourseSectionID = %u AND Grade.StudentID = %u AND Grade.PromptID = WorksheetPrompt.PromptID)'.
                        ' LEFT JOIN `%s` Prompt ON (Prompt.ID = WorksheetPrompt.PromptID)'.
                        ' WHERE WorksheetPrompt.WorksheetID = %u AND Grade.Grade IS NOT NULL'.
                        ' ORDER BY Grade.Created DESC',
                        [
                            StandardsPromptGrade::$tableName,
                            $termIDString ? 'Grade.TermID IN (' . $termIDString . ') AND' : '',
                            $WorksheetAssignment->CourseSectionID,
                            $params['StudentID'],
                            StandardsPrompt::$tableName,
                            $WorksheetAssignment->WorksheetID
                        ]
                    );

                    $totalPrompts = DB::oneValue('SELECT COUNT(*) FROM `%s` WHERE WorksheetID = %u', [
                        StandardsWorksheetPrompt::$tableName,
                        $WorksheetAssignment->WorksheetID
                    ]);

                    if (count($scoredPrompts) && count($scoredPrompts) == $totalPrompts) {
                        $Student = Student::getByID($params['StudentID']);
                        $Teacher = $Section->Instructors[0];
                        $Advisor = $Student->Advisor;

                        $standard = [
                            'Date' => $scoredPrompts[0]['Created'],
                            'Class' => 'Standards',
                            'Prompts' => $scoredPrompts,
                            'AdvisorFullName' => $Advisor ? $Advisor->FullName : '',
                            'AdvisorEmail' => $Advisor ? $Advisor->Email : '',
                            'StudentFullName' => $Student->FullName,
                            'TermTitle' => $WorksheetAssignment->Term->Title,
                            'SectionTitle' => $Section->Title,
                            'TeacherFullName' => $Teacher->FullName,
                            'TeacherEmail' => $Teacher->Email
                        ];

                        $standards[] = $standard;
                    }
                }
            }
        }

        return $standards;
    }
}