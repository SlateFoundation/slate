<?php

namespace Slate\Progress;

interface IStudentReport
{
    
    public function getAuthor();
    public function getStudent();
    
    public static function getStylesheet();
    public static function getType();

    public function getReportHeader();
    public function getRecordHeader();
    public function getBody();
}