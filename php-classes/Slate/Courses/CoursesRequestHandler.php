<?php

namespace Slate\Courses;

class CoursesRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler config
    public static $recordClass = 'Slate\\Courses\\Course';
    public static $browseOrder = ['Code' => 'ASC'];
}