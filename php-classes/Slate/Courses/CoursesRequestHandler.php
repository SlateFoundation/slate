<?php

namespace Slate\Courses;


class CoursesRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = Course::class;
    public static $accountLevelBrowse = false;
    public static $browseOrder = ['Code' => 'ASC'];
}