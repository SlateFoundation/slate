<?php

namespace Slate\Progress;

use Emergence\People\IPerson;


interface IStudentReport
{
    public static function getNoun($count = 1);

    public function getTimestamp();
    public function getAuthor();
    public function getStudent();
    public function getTitle();
    public function getStatus(); // Should return 'draft' or 'published'

    public static function getCss(array $templateData = []);
    public function getBodyHtml($headingLevel = 2, array $templateData = [], $alternate = null);

    public static function getAllByStudent(IPerson $Student);
}