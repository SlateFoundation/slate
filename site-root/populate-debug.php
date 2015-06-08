<?php

#$class = "\\Slate\\Courses\\Section";
#$Student = \Slate\Student::getByWhere(array('Class' => 'Slate\\Student'));
#$Student->PrimaryEmailID = 160;
#$Student->save();
#MICS::dump($Student , 'class', true);
$TeacherEmail = 'test@test.com';
$emailContactPointClass = new Emergence\People\ContactPoint\Email();

$TeacherEmailContactPoint = $emailContactPointClass::create(array(
    'PersonID'    =>   1
    ,'Label' => 'School Email'
));

$TeacherEmailContactPoint->address = $TeacherEmail;

if (!$TeacherEmailContactPoint->validate() ) {
    MICS::dump($TeacherEmailContactPoint->getValidationErrors(), 'Validation Errors');
}

MICS::dump($TeacherEmailContactPoint, 'Teacher Email', true);