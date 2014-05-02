<?php

namespace Emergence\People;

use ActiveRecord;
use Person;
use User;

class RelationshipsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    public static $recordClass = 'Emergence\People\Relationship';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelRead = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = array('ID' => 'ASC');

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if (!empty($_REQUEST['person']) && ctype_digit($_REQUEST['person'])) {
#            $conditions[] = sprintf('%u IN (PersonID, RelatedPersonID)', $_REQUEST['person']);
            $conditions['PersonID'] = $_REQUEST['person'];
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    protected static function applyRecordDelta(ActiveRecord $Relationship, $data)
    {
        // get relationship-based defaults
        if ($data['Relationship'] && !empty(Relationship::$relationshipTypes[$data['Relationship']])) {
            $defaults = Relationship::$relationshipTypes[$data['Relationship']];

            if ($Relationship->isPhantom && !empty($defaults['Relationship'])) {
                $Relationship->setFields($defaults['Relationship']);
            }
        }

        // call parent
        parent::applyRecordDelta($Relationship, $data);

        if (!empty($data['relatedPerson'])) {
            if (ctype_digit($data['relatedPerson'])) {
                $Relationship->RelatedPerson = Person::getByID($data['relatedPerson']);
            } else {
                $name = trim($data['relatedPerson']);
                $parts = preg_split('/\s+/', $name, 2);

                if (count($parts) == 1) {
                    $Relationship->RelatedPerson = User::getByUsername($name);
                } else {
                    $Relationship->RelatedPerson = Person::getOrCreateByFullName($parts[0], $parts[1]);

                    if (!empty($defaults['Person']) && $Relationship->RelatedPerson->isPhantom) {
                        $Relationship->RelatedPerson->setFields($defaults['Person']);
                    }
                }
            }
        }
    }

#    protected static function getEditResponse($responseID, $responseData)
#    {
#        if ($responseData['success'] && $responseData['data']->RelatedPerson && $responseData['data']->RelatedPerson->isNew) {
#            $responseData['newPerson'] = $responseData['data']->RelatedPerson;
#        }
#
#        return $responseData;
#    }
}