<?php

declare(strict_types=1);

namespace Slate\Courses;

class SchedulesRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = Schedule::class;
    public static $accountLevelBrowse = false;
    public static $browseOrder = ['Title' => 'ASC'];
}
