<?php

declare(strict_types=1);

namespace Slate\Courses;

class DepartmentsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = \Slate\Courses\Department::class;
    public static $browseOrder = ['Title' => 'ASC'];
}
