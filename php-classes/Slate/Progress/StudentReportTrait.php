<?php

namespace Slate\Progress;

trait StudentReportTrait
{
    public function getAuthor()
    {
        return $this->Creator;
    }
    
    public function getStudent()
    {
        return $this->Student;
    }
    
    public function getType()
    {
        return 'Student';
    }
}