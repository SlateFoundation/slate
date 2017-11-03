<?php

namespace Slate\Courses;


class SectionParticipantsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = SectionParticipant::class;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelAPI = 'Staff';

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_GET['course_section'])) {
            if (!$CourseSection = SectionsRequestHandler::getRecordByHandle($_GET['course_section'])) {
                return static::throwNotFoundError('Course Section not found');
            }

            $conditions['CourseSectionID'] = $CourseSection->ID;
        }

        if (!empty($_GET['role'])) {
            $conditions['Role'] = [
                'values' => is_string($_GET['role']) ? explode(',', $_GET['role']) : $_GET['role']
            ];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }
}