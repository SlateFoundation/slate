<?php

namespace Slate\Courses;

class DepartmentsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = 'Slate\\Courses\\Department';
    public static $browseOrder = ['Title' => 'ASC'];
}