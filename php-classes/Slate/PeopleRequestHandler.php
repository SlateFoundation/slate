<?php

namespace Slate;

use Slate\Courses\Section;
use Slate\Courses\SectionParticipant;

class PeopleRequestHandler extends \PeopleRequestHandler
{
    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*advisors':
                return static::respond('advisors', array(
                    'data' => Student::getDistinctAdvisors()
                ));
            case '*graduation-years':
                return static::respond('graduation-years', array(
                    'data' => Student::getDistinctGraduationYears()
                ));
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleRecordRequest(\ActiveRecord $Person, $action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case 'courses':
                return static::handleCoursesRequest($Person);
            default:
                return parent::handleRecordRequest($Person, $action);
        }
    }

    public static function handleCoursesRequest(\Person $Person)
    {
        if (!empty($_REQUEST['termID'])) {
            $Term = Term::getByID($_REQUEST['termID']);
        } else {
            $Term = Term::getCurrent();
        }

        if (!$Term) {
            return static::throwNotFoundError('Term not found');
        }

        return static::respond('sections', array(
            'data' => Section::getAllByQuery(
                'SELECT sections.* FROM `%s` participants INNER JOIN `%s` sections ON (participants.CourseSectionID = sections.ID) WHERE sections.Status = "Live" AND participants.PersonID = %u AND sections.TermID IN (%s)'
                ,array(
                    SectionParticipant::$tableName
                    ,Section::$tableName
                    ,$Person->ID
                    ,implode(',', $Term->getRelatedTermIDs())
                )
            )
        ));
    }
}