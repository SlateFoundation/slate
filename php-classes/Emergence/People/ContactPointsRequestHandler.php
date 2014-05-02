<?php

namespace Emergence\People;

use Person;
use User;

class ContactPointsRequestHandler extends \RecordsRequestHandler
{
    // RecordsRequestHandler configuration
    static public $recordClass = 'Emergence\People\ContactPoint\AbstractPoint';
    static public $accountLevelBrowse = 'Staff';
    static public $accountLevelRead = 'Staff';
    static public $accountLevelWrite = 'Staff';
    static public $accountLevelAPI = 'Staff';
    static public $browseOrder = array('ID' => 'ASC');

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
        $templates = ContactPoint\AbstractPoint::getTemplates();

        foreach ($templates AS $label => &$options) {
            $options['label'] = $label;
        }

        usort($templates, function($a, $b) {
            return strcmp($a['class'], $b['class']);
        });

        return static::respond('templates', array(
            'data' => array_values($templates)
        ));
    }

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if (!empty($_REQUEST['person']) && ctype_digit($_REQUEST['person'])) {
            $conditions['PersonID'] = $_REQUEST['person'];
        } elseif (!empty($_REQUEST['relatedTo']) && ctype_digit($_REQUEST['relatedTo'])) {
            if (!$Person = Person::getByID($_REQUEST['relatedTo'])) {
                return static::throwNotFoundError('relatedTo person not found');
            }

            $relatedIDs = array_map(function($Relationship) {
                return $Relationship->RelatedPersonID;
            }, $Person->Relationships);

            $relatedIDs[] = $Person->ID;

            $conditions[] = 'PersonID IN ('.implode(',', $relatedIDs).')';
        }

        // build class-weight-based sorter
        $pointClasses = ContactPoint\AbstractPoint::getStaticSubclasses();

        // initialize all classes before sorting to prevent modifying during sort due to initialization
        $pointClasses = array_filter($pointClasses, 'class_exists');

        // sort classes
        usort($pointClasses, function($a, $b) {
            $aWeight = $a::$sortWeight;
            $bWeight = $b::$sortWeight;

            if ($aWeight == $bWeight) {
                return strcmp($a, $b);
            }

            return ($aWeight < $bWeight) ? 1 : -1;
        });

        static::$browseOrder = 'FIND_IN_SET(Class, "'.\DB::escape(implode(',', $pointClasses)).'"), ID ASC';

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    static protected function applyRecordDelta(\ActiveRecord $ContactPoint, $data)
    {
        if (isset($data['String'])) {
            $ContactPoint->loadString($data['String']);
            unset($data['String']);
        } elseif(isset($data['Data'])) {
            $ContactPoint->unserialize($data['Data']);
            unset($data['Data']);
        }

        return parent::applyRecordDelta($ContactPoint, $data);
    }
}