<?php

namespace Slate\Courses;

class SectionTermDataRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = SectionTermData::class;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelAPI = 'Staff';
}