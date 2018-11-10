<?php

namespace Slate\Courses;


class SectionParticipantsRequestHandler extends \Slate\RecordsRequestHandler
{
    public static $recordClass = SectionParticipant::class;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelAPI = 'Staff';


    protected static function buildBrowseConditions(array $conditions = [], array &$filterObjects = [])
    {
        $conditions = parent::buildBrowseConditions($conditions, $filterObjects);

        if ($Section = static::getRequestedSection()) {
            $conditions['CourseSectionID'] = $Section->ID;
            $filterObjects['Section'] = $Section;
        }

        if (!empty($_REQUEST['cohort'])) {
            $conditions['Cohort'] = $_REQUEST['cohort'];
        }

        if (!empty($_REQUEST['role'])) {
            $conditions['Role'] = [
                'values' => is_string($_REQUEST['role']) ? explode(',', $_REQUEST['role']) : $_REQUEST['role']
            ];
        }

        return $conditions;
    }
}