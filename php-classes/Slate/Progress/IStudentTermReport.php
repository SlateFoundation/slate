<?php

namespace Slate\Progress;

use Slate\Term;

interface IStudentTermReport extends IStudentReport
{
    public function getTerm();

    public static function getAllByTerm(Term $Term = null);
    
}