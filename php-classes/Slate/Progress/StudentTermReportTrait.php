<?php

namespace Slate\Progress;

use Slate\Term;

/*
* Trait to be implemented in ActiveRecord classes
*/

trait StudentTermReportTrait
{
    public function getTerm()
    {
        return $this->Term;
    }
    
    public static function getAllByTerm(Term $Term = null, array $conditions = [])
    {
        if ($Term) {
            $conditions['TermID'] = $Term->ID;
        }
        
        return static::getAllByWhere($conditions);
    }
    
    public static function getAllByStudent(IPerson $Student, array $conditions = [])
    {
        return static::getAllByWhere(array_merge([
            'StudentID' => $Student->ID    
        ], $conditions));
    }
}
