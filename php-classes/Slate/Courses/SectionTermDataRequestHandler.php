<?php

namespace Slate\Courses;

use Slate\TermsRequestHandler;

class SectionTermDataRequestHandler extends \Slate\RecordsRequestHandler
{
    public static $recordClass = SectionTermData::class;

    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelAPI = 'Staff';


    protected static function buildBrowseConditions(array $conditions = [], array &$filterObjects = [])
    {
        $conditions = parent::buildBrowseConditions($conditions, $filterObjects);

        if ($Section = static::getRequestedSection()) {
            $conditions['SectionID'] = $Section->ID;
            $filterObjects['Section'] = $Section;
        }

        if ($Term = static::getRequestedTerm()) {
            $conditions['TermID'] = [ 'values' => $Term->getRelatedTermIDs() ];
            $filterObjects['Term'] = $Term;
        }

        return $conditions;
    }
}