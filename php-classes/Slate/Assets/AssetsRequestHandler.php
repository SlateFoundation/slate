<?php

namespace Slate\Assets;

use Slate\Assets\Asset;
use Slate\Assets\Alias;
use StatusesRequestHandler;
use Emergence\Locations\Location;
use Slate\Assets\Importer;
use DB;
use TableNotFoundException;

class AssetsRequestHandler extends \ActivityRecordsRequestHandler
{
    public static $recordClass = \Slate\Assets\Asset::class;
    // configurables
    public static $accountLevelRead = 'Staff';
    public static $accountLevelBrowse = 'Staff';
    public static $accountLevelWrite = 'Staff';
    public static $accountLevelAPI = false;
    public static $browseOrder = false;
    public static $browseConditions = false;
    public static $browseLimitDefault = false;
    public static $editableFields = false;
    
    public static $userResponseModes = array(
        'application/json' => 'json'
    );
    
    public static function handleRequest()
    {
        if (static::peekPath() == 'search') {
            return static::handleSearchRequest();
        } else if (static::peekPath() == 'import') {
            return Importer::handleRequest();
        }
        
        return parent::handleRequest();
    }

    public static function handleRecordsRequest($action = false)
    {
        
        switch ($action = $action ? $action : static::shiftPath()) {
            case '*locations':
            case 'locations':
            {
                return static::handleLocationsRequest();
            }
            case '*statuses':
            case 'statuses':
            {
                return static::handleStatusesRequest();
            }
            case '*models': 
            {
                return static::handleModelsRequest();
            }
            case '*manufacturers':
            {
                return static::handleManufacturersRequest();
            }
            case '*extra-info-fields':
            {
                return static::handleExtraInfoFieldsRequest();
            }  

            default:
                return parent::handleRecordsRequest($action);
        }

    }
    
    public static function handleRecordRequest(\ActiveRecord $Record, $action = false)
    {
        switch ($action = $action ? $action : static::shiftPath()) {
            case 'tickets':
            {
                return static::handleTicketsRequest($Record);
            }
            
            default:
                return parent::handleRecordRequest($Record, $action);
        }
    }
    
    public static function handleQueryRequest($query, $conditions = array(), $options = array(), $responseID = null, $responseData = array(), $mode = 'AND')
    {
        $className = static::$recordClass;
        if(!empty($_REQUEST['sort'])) {
        	$dir = (empty($_REQUEST['dir']) || $_REQUEST['dir'] == 'ASC') ? 'ASC' : 'DESC';
			
			if($className::sorterExists($_REQUEST['sort'])) {
				$order = call_user_func($className::getSorter($_REQUEST['sort']), $dir, $_REQUEST['sort']);
			}
			elseif($className::fieldExists($_REQUEST['sort'])) {
				$order = array(
					$_REQUEST['sort'] => $dir
				);
			}
			else {
				return static::throwError('Invalid sort field');
			}
		}
		else {
			$order = static::$browseOrder;
		}
        
        if (empty($order)) {
            $order = false;
        }
        return parent::handleQueryRequest($query, $conditions, $order ? array_merge(['order' => $order], $options) : $options, $responseID, $responseData, $mode);
    }
    
    public static function handleSearchRequest()
    {
        if (!$_REQUEST['q']) {
            return static::throwInvalidRequestError('You must supply a query.');
        }
        
        $query = DB::escape($_REQUEST['q']);
        try {            
            $aliases = DB::allValues('ID', 'SELECT ID FROM `%s` WHERE Identifier LIKE "%%%s%%" ORDER BY Identifier ASC LIMIT 0,10', array(Alias::$tableName, $query));
        } catch (TableNotFoundException $e) {
            $aliases = [];
        }

        $assignees = DB::allValues('ID', 'SELECT ID FROM `%s` WHERE CONCAT(FirstName, " ", LastName) LIKE "%%%s%%" ORDER BY CONCAT(FirstName, " ", LastName) ASC LIMIT 0,10', array(\Person::$tableName, $query));

        $matches = [];
        
        foreach ($aliases AS &$aliasId) {
            $alias = Alias::getByID($aliasId);
            if ($alias->ObjectClass == 'Slate\Assets\Asset') {
                $asset = $alias->Object;
                $aliasId = array('matches' => $alias->getData()) + $asset->getDetails(array('Aliases', 'Assignee')); 
            } else {
                unset($aliasId);
            }
        }
        
        foreach ($assignees AS $assigneeId) {
            $Assignee = \Person::getByID($assigneeId);

            if ($Assignee && $Assets = Asset::getAllByWhere(array('AssigneeID' => $assigneeId))) {
                $count = 0;
                foreach ($Assets AS $Asset) {
                    if ($count < 10) {
                        $matches[] = array('matches' => $Assignee->getData()) + $Asset->getDetails(array('Aliases', 'Assignee'));
                        $count++;    
                    }
                }
            }
        }
        
        $responseData = $matches + $aliases;
        
        return static::respond('assetsSearch', array(
            'data' => $responseData,
            'success' => true,
            'total' => count($responseData)
        ));
    }
    
    public static function handleBrowseActivityRequest($Record, $options = array(), $conditions = array(), $responseID = null, $responseData = array())
    {
        return static::respond('asset/activity', array(
            'data' => $Record->getStories() 
        ));
    }
    
    public static function handleTicketsRequest(\ActiveRecord $Record)
    {
        return static::respond('assetTickets', array(
            'data' => $Record->Tickets,
            'total' => count($Record->Tickets),
            'success' => true
        ));
    }
    
    public static function handleExtraInfoFieldRequest($fieldName)
    {
        $values = array();
        
        $qvalue = \DB::escape($_REQUEST['q']);
        $conditions = array(sprintf('Data LIKE "%%%s%%"', $fieldName));
        
        $recordClass = static::$recordClass;
        $records = $recordClass::getAllByWhere($conditions);

        foreach ($records AS $record) {
            $value = $record->Data[$fieldName];

            if (!empty($value) && !in_array($value, $values)) {
                
                if ($qvalue && strpos(strtolower($value), strtolower($qvalue)) === false) {
                    continue;
                }
                
                $values[] = $value;
            }
        }
        
        foreach ($values AS &$value) {
            $value = array(
                'name' => $value  
            );
        }
        
        return static::respond('assetData'.$fieldName.'s', array(
            'data' => $values,
            'field' => $fieldName,
            'success' => true,
            'total' => count($values),
            'conditions' => $conditions
        ));
    }
    
    public static function handleExtraInfoFieldsRequest()
    {
        
        if ($path = static::shiftPath()) {
            return static::handleExtraInfoFieldRequest($path);
        }
        
        $extraInfoFields = array();
        
        $recordClass = static::$recordClass;
        
        $records = $recordClass::getAllByWhere(array('Data IS NOT NULL'));
        
        foreach ($records AS $record) {
            if(!$record->Data) {
                continue;
            }
            
            foreach ($record->Data AS $field => $value) {
                if (!in_array($field, $extraInfoFields)) {
                    $extraInfoFields[] = $field;
                }
            }
        }
        
        foreach ($extraInfoFields AS &$field) {
            $field = array(
                'name' => $field  
            );
        }
        
        return static::respond('assetExtraInfoFields', array(
            'data' => $extraInfoFields,
            'total' => count($extraInfoFields),
            'success' => true
        ));
    }
    
    public static function handleManufacturersRequest()
    {
        $manufacturers = array();
        $distinctManufacturers = array();
        
        $qvalue = \DB::escape($_REQUEST['q']);
        $conditions = array('Data LIKE "%%Manufacturer%%"');
        
        $recordClass = static::$recordClass;
        $records = $recordClass::getAllByWhere($conditions);

        foreach ($records AS $record) {
            $manufacturer = $record->Data['Manufacturer'];

            if (!empty($manufacturer) && !in_array($manufacturer, $distinctManufacturers)) {
                
                if ($qvalue && strpos(strtolower($manufacturer), strtolower($qvalue)) === false) {
                    continue;
                }
                
                $manufacturers[] = array(
                    'name' => $manufacturer
                );
                
                $distinctManufacturers[] = $manufacturer;
            }
        }
        
        return static::respond('assetDataManufacturers', array(
            'data' => $manufacturers,
            'success' => true,
            'total' => count($manufacturers),
            'conditions' => $conditions
        ));
    }
    
    public static function handleModelsRequest()
    {
        $models = array();
        $distinctModels = array();
        
        $qvalue = \DB::escape($_REQUEST['q']);
        $conditions = array('Data LIKE "%%Model%%"');
        
        $recordClass = static::$recordClass;        
        $records = $recordClass::getAllByWhere($conditions);
        
        foreach ($records AS $record) {
            $model = $record->Data['Model'];
            
            if (!empty($model) && !in_array($model, $distinctModels)) {
                
                if ($qvalue && strpos(strtolower($model), strtolower($qvalue)) === false) {
                    continue;
                }
                
                $models[] = array(
                    'name' => $model  
                );
                $distinctModels[] = $model;
            }
        }
        
        return static::respond('assetDataModels', array(
            'data' => $models,
            'success' => true,
            'total' => count($models)
        ));
    }

    public static function handleLocationsRequest()
    {
        return \Emergence\Locations\LocationsRequestHandler::handleRecordsRequest();
    }

    public static function handleStatusesRequest()
    {
        return \Slate\Assets\StatusesRequestHandler::handleRecordsRequest();
    }
    
    protected static function applyRecordDelta(\ActiveRecord $Record, $data)
    {   
        parent::applyRecordDelta($Record, $data);
        
        if (!empty($data['AssigneeClass'])) {
            $assigneeClass = DB::escape($data['AssigneeClass']);
            
            if (class_exists($assigneeClass) && is_subclass_of(new $assigneeClass(), 'Emergence\\People\\Person')) {
                $Record->AssigneeClass = 'Person';
            }
            else if (class_exists($assigneeClass) && is_subclass_of(new $assigneeClass(), 'Emergence\\Groups\\Group')) {
                $Record->AssigneeClass = 'Group';
            }
        }
        
	}
    
    protected static function onRecordSaved(\ActiveRecord $Record, $data)
    {
        parent::onRecordSaved($Record, $data);
        
        $newAliases = array();
        $keepAliases = array();
        if (!empty($data['Aliases'])) {
            foreach ($data['Aliases'] AS $alias) {
                if (empty($alias['Type']) || empty($alias['Identifier'])) {
                    continue;
                }
    
                $currentAlias = Alias::getByWhere(array('Type' => $alias['Type'], 'ObjectClass' => $Record->Class, 'ObjectID' => $Record->ID));
                //update already created aliases
                if ($currentAlias) {
                    $currentAlias->Identifier = $alias['Identifier'];
                    $currentAlias->save(false);
                    $newAliases[] = $currentAlias;
                    $keepAliases[] = $currentAlias->ID;
                    
                } else if ($currentAlias = Alias::getByIdentifier($alias['Identifier'], $alias['Type'])) {
                    //if alias belongs to a different record.
                    $currentAlias->ObjectID = $Record->ID;
                    $currentAlias->ObjectClass = $Record->Class;
                    $currentAlias->save(false);
                    $newAliases[] = $currentAlias;
                } else {
                    $Alias = Alias::create(array(
                        'Type' => $alias['Type'],
                        'Identifier' => $alias['Identifier'],
                        'ObjectClass' => $Record->Class,
                        'ObjectID' => $Record->ID
                    ), true);
                    $newAliases[] = $Alias;
                }
            }
            
            if(!empty($keepAliases)) {
                $query = 'DELETE FROM `%s` WHERE ObjectClass = "%s" AND ObjectID = %u AND ID NOT IN("%s")';
                $params = array(
                    Alias::$tableName,
                    $Record->Class,
                    $Record->ID,
                    join($keepAliases, '", "')
                );
            } else {
                $query = 'DELETE FROM `%s` WHERE ObjectClass = "%s" AND ObjectID = %u';
                $params = array(
                    Alias::$tableName,
                    $Record->Class,
                    $Record->ID
                );
            }
            
            DB::nonQuery($query, $params);
            
            $Record->Aliases = $newAliases;
        }
    }
    
    
}