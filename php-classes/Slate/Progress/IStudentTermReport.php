<?php

declare(strict_types=1);

namespace Slate\Progress;

use Slate\Term;
use Emergence\People\IPerson;


interface IStudentTermReport extends IStudentReport
{
    public function getTerm();

    public static function getAllByTerm(Term $Term);
    public static function getAllByStudentTerm(IPerson $Student, Term $Term);
}
