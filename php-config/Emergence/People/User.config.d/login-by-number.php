<?php

Emergence\People\User::$fallbackUserFinders['StudentNumber'] = function($username) {
    return Slate\People\Student::getByStudentNumber($username);
};