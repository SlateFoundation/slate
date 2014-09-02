<?php

namespace Slate\Courses;

class SchedulesRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Slate\\Courses\\Schedule';
    public static $browseOrder = ['Title' => 'ASC'];
}