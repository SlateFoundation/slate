<?php

if (property_exists(Emergence\People\User::class, 'fallbackUserFinders')) {
    Emergence\People\User::$fallbackUserFinders['StudentNumber'] = function($username) {
        return Slate\People\Student::getByStudentNumber($username);
    };
}