<?php

namespace Emergence\CMS;

use ActiveRecord;
use Media;
use Tag;

abstract class AbstractRequestHandler extends \RecordsRequestHandler
{
    #    public static $contentTypes = array(
#        'Emergence\CMS\Page' => array(
#            'handler' => '/pages'
#            ,'editor' => 'CMS.PageEditor'
#        )
#        ,'Emergence\CMS\BlogPost' => array(
#            'handler' => '/blog'
#            ,'editor' => 'CMS.BlogPostEditor'
#        )
#    );
#
#    public static $contentItemTypes = array(
#        'Emergence\CMS\Item\RichText' => array(
#            'composer' => 'CMS.Composer.RichTextComposer'
#            //'composer' => 'CMS.Composer.WYMTextComposer'
#        )
#        ,'Emergence\CMS\Item\Media' => array(
#            'composer' => 'CMS.Composer.MediaComposer'
#        )
#    );
#
#    public static $defaultItems = array(
#        'Emergence\CMS\RichTextContent'
#    );

    // RecordsRequestHandler config
    public static $recordClass = 'Emergence\CMS\AbstractContent';
    public static $accountLevelRead = false;
    public static $accountLevelBrowse = false;
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = 'Staff';
    public static $browseOrder = array('Published' => 'DESC');

    public static function handleBrowseRequest($options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        if (!$GLOBALS['Session']->hasAccountLevel('Staff') || empty($_GET['showall'])) {
            $conditions['Status'] = 'Published';
            $conditions[] = 'Published IS NULL OR Published <= CURRENT_TIMESTAMP';
        }

        return parent::handleBrowseRequest($options, $conditions, $responseID, $responseData);
    }

    public static function getRecordByHandle($handle)
    {
        $Record = parent::getRecordByHandle($handle);

        // redirect to correct handler
        if ($Record && !is_a($Record, static::$recordClass)) {
            $url = $Record->getURL();

            if ($rest = static::getPath()) {
                $url .= '/'.implode('/', $rest);
            }

            \Site::redirect($url);
        }

        return $Record;
    }

    protected static function onRecordCreated(ActiveRecord $Content, $requestData)
    {
        // initialite title
        if (!empty($_GET['Title'])) {
            $Content->Title = $_GET['Title'];
        }

        // initialize status
        if (!empty($_GET['Status']) && in_array($_GET['Status'], $Content::getFieldOptions('Status', 'values'))) {
            $Content->Status = $_GET['Status'];
        }
    }

    // TODO: eliminate $responseData ? it's not used anywhere
    // TODO: migrate most of this to applyRecordDelta
    protected static function onRecordSaved(ActiveRecord $Content, $requestData)
    {
        $responseData = array();

        // save items
        if (is_array($requestData['items'])) {
            $responseData['changedItems'] = array();
            $responseData['newItems'] = array();
            $responseData['deletedItems'] = array();
            $responseData['invalidItems'] = array();
            $responseData['phantomsMap'] = array();

            // sort and save items
            foreach ($requestData['items'] AS $itemData) {
                if (!empty($itemData['ID']) && is_numeric($itemData['ID'])) {
                    // modify an existing item
                    $Item = Item\AbstractItem::getByID($itemData['ID']);
                    $Item->setFields($itemData);

                    if ($Item->validate()) {
                        $Item->save();
                        $responseData['changedItems'][$Item->ID] = $Item;
                    } else {
                        $responseData['invalidItems'][] = $Item;
                    }
                } else {
                    // create a new item
                    if (!empty($itemData['Class']) && in_array($itemData['Class'], Item\AbstractItem::$subClasses)) {
                        $className = $itemData['Class'];
                    } else {
                        $className = Item\AbstractItem::$defaultClass;
                    }

                    $itemData['ContentID'] = $Content->ID;
                    $Item = $className::create($itemData);

                    if ($Item->validate()) {
                        $Item->save();
                        $responseData['newItems'][$Item->ID] = $Item;

                        if ($itemData['ID']) {
                            $responseData['phantomsMap'][$itemData['ID']] = $Item->ID;
                        }
                    } else {
                        $responseData['invalidItems'][] = $Item;
                    }
                }
            }

            // remove deleted items
            $currentItemIDs = array_merge(array_keys($responseData['changedItems']), array_keys($responseData['newItems']));

            $responseData['deletedItems'] = array_filter($Content->Items, function($Item) use ($currentItemIDs) {
                return !in_array($Item->ID, $currentItemIDs);
            });

            if ($responseData['deletedItems']) {
                foreach ($responseData['deletedItems'] AS $Item) {
                    $Item->Status = 'Deleted';
                    $Item->save();
                }

                $Content->Items = array_filter($Content->Items, function($Item) {
                    return $Item->Status != 'Deleted';
                });
            }

            // update layout if there were phantoms
            if (is_array($requestData['LayoutConfig']['itemOrder'])) {
                foreach ($requestData['LayoutConfig']['itemOrder'] AS &$column) {
                    if (!is_array($column)) {
                        continue;
                    }

                    foreach ($column AS &$itemID) {
                        if (array_key_exists($itemID, $responseData['phantomsMap'])) {
                            $itemID = $responseData['phantomsMap'][$itemID];
                        } else {
                            $itemID = (int)$itemID;
                        }
                    }
                }

                $Content->LayoutConfig = $requestData['LayoutConfig'];
            }
        }

        // assign context to media
        if (is_array($requestData['contextMedia'])) {
            foreach ($requestData['contextMedia'] AS $mediaID) {
                if (!is_numeric($mediaID)) {
                    continue;
                }

                if (!$Media = Media::getByID($mediaID)) {
                    continue;
                }

                if ($Media->Context) {
                    continue;
                }

                $Media->Context = $Content;
                $Media->save();
            }
        }

        // assign tags
        if (is_array($requestData['tags'])) {
            Tag::setTags($Content, $requestData['tags']);
        }

        // save any page changes
        $Content->save();
    }


#    protected static function getEditResponse($responseID, $responseData)
#    {
#        $responseData['contentTypes'] = static::$contentTypes;
#        foreach ($responseData['contentTypes'] AS $contentClass => &$cfg) {
#            if (empty($cfg['singularNoun'])) {
#                $cfg['singularNoun'] = $contentClass::$singularNoun;
#            }
#
#            if (empty($cfg['pluralNoun'])) {
#                $cfg['pluralNoun'] = $contentClass::$pluralNoun;
#            }
#        }
#
#
#        $responseData['contentItemTypes'] = static::$contentItemTypes;
#        foreach ($responseData['contentItemTypes'] AS $contentItemClass => &$cfg) {
#            if (empty($cfg['singularNoun'])) {
#                $cfg['singularNoun'] = $contentItemClass::$singularNoun;
#            }
#
#            if (empty($cfg['pluralNoun'])) {
#                $cfg['pluralNoun'] = $contentItemClass::$pluralNoun;
#            }
#        }
#
#
#        $responseData['defaultItems'] = array();
#        foreach (static::$defaultItems AS $value) {
#            if (is_string($value)) {
#                $value = array(
#                    'Class' => $value
#                );
#            }
#
#            $responseData['defaultItems'][] = $value;
#        }
#
#        return $responseData;
#    }
}