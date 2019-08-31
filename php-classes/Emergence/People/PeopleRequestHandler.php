<?php

namespace Emergence\People;

use ActiveRecord;
use Media;
use MediaRequestHandler;


class PeopleRequestHandler extends \PeopleRequestHandler
{
    public static $personClass = Person::class;
    public static $userClass = User::class;
    public static $groupClass = Groups\Group::class;
    public static $recordClass = Person::class;
}