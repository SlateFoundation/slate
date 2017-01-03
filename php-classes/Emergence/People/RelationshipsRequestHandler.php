<?php

namespace Emergence\People;

use ActiveRecord;

class RelationshipsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    public static $recordClass = 'Emergence\People\Relationship';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = ['ID' => 'ASC'];

    public static function handleRecordsRequest($action = false)
    {
        switch ($action ? $action : $action = static::shiftPath()) {
            case '*templates':
                return static::handleTemplatesRequest();
            default:
                return parent::handleRecordsRequest($action);
        }
    }

    public static function handleTemplatesRequest()
    {
        return static::respond('templates', [
            'data' => array_values(Relationship::getTemplates())
        ]);
    }

    public static function handleBrowseRequest($options = [], $conditions = [], $responseID = null, $responseData = [])
    {
        if (!empty($_REQUEST['person']) && ctype_digit($_REQUEST['person'])) {
            $conditions['PersonID'] = $_REQUEST['person'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    protected static function applyRecordDelta(ActiveRecord $Relationship, $data)
    {
        // select related person
        if (!empty($data['RelatedPerson']) && is_array($data['RelatedPerson'])) {
            unset($data['RelatedPersonID']);

            if (!empty($data['RelatedPerson']['ID']) && is_numeric($data['RelatedPerson']['ID'])) {
                $Relationship->RelatedPerson = Person::getByID($data['RelatedPerson']['ID']);
            } else {
                $Relationship->RelatedPerson = Person::create($data['RelatedPerson']);
            }
        }

        // call parent
        parent::applyRecordDelta($Relationship, $data);

        // create or update inverse relationship
        if (!empty($data['InverseRelationship']) && is_array($data['InverseRelationship'])) {
            if ($Relationship->InverseRelationship) {
                $Relationship->InverseRelationship->setFields($data['InverseRelationship']);
            } else {
                if (!empty($data['InverseRelationship']['Class'] && in_array($data['InverseRelationship']['Class'], Relationship::getStaticSubclasses()))) {
                    $inverseClass = $data['InverseRelationship']['Class'];
                } else {
                    $inverseClass = Relationship::getStaticDefaultClass();
                }

                $InverseRelationship = $inverseClass::create($data['InverseRelationship']);
                $InverseRelationship->Person = $Relationship->RelatedPerson;
                $InverseRelationship->RelatedPerson = $Relationship->Person;
                $Relationship->InverseRelationship = $InverseRelationship;
            }
        }
    }
}