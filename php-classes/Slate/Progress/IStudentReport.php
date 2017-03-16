<?php

namespace Slate\Progress;

interface IStudentReport
{   
    public function getAuthor();
    public function getStudent();
    
    public function getBodyHTML();
    public function getHeaderHTML();

    public static function getType();
    public static function getCSS();
}