<?php

namespace Slate\Progress;

use Slate\Term;
use Emergence\People\IPerson;


trait StudentTermReportTrait
{
    public function getTerm()
    {
        return $this->Term;
    }

    public static function getAllByTerm(Term $Term, array $options = [])
    {
        return static::getAllByWhere('TermID IN ('.implode(',', $Term->getContainedTermIDs()).')', $options);
    }

    public static function getAllByStudentTerm(IPerson $Student, Term $Term)
    {
        return static::getAllByWhere([
            'StudentID' => $Student->ID,
            'TermID IN ('.implode(',', $Term->getContainedTermIDs()).')'
        ], ['order' => ['ID' => 'DESC']]);
    }
}
