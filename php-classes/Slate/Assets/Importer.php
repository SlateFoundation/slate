<?php

namespace Slate\Assets;

use SpreadsheetReader;
use Slate\Assets\Asset;
use Slate\Assets\Alias;
use Slate\Assets\Status;
use Slate\People\Student;
use Emergence\Locations\Location;
use Emergence\People\Person;
use Emergence\People\User;
use CommentActivity;

class Importer extends \RequestHandler
{
    public static $verbose = true;
    public static $pretend = true;
    
    public static $uploadFileName = 'assets-import-file';
    public static $validUploadFileTypes = array('text/csv');
    
    //used to prefix related/dynamic fields
    public static $dynamicFieldPrefix = "|";
    public static $validFieldPrefixes = array('Data', 'Alias', 'Assignee');
    
    public static $defaultLocation = 'With Student';
    public static $defaultStatus = 'Deployed';
    
    public static $recordClass = Asset::class;
    
    public static $fields = [
        'Name'
    ];
    
    public static $dynamicFields = [
        'Data' => [
            'getter' => 'extractData',
            'setter' => 'setData'
        ]
    ];
    
    public static $relationships = [
        'Location' => [
            'class' => \Emergence\Locations\Location::class,
            'type' => 'one-one',
            'default' => 'With Student',
            'required' => false
        ],
        'Status' => [
            'class' => \Slate\Assets\Status::class,
            'type' => 'one-one',
            'default' => 'Deployed',
            'required' => true
        ],
        'Assignee' => [
            'classes' => [\Emergence\People\User::class, \Emergence\People\Groups\Group::class],
            'type' => 'one-one',
            'default' => null,
            'required' => false
        ],
        'Aliases' => [
            'class' => \Slate\Assets\Alias::class,
            'type' => 'one-many',
            'default' => null
        ],
        'Activity' => [
            'class' => \CommentActivity::class,
            'type' => 'one-many',
            'default' => null
        ]
    ];
    
    public static function handleRequest()
    {
        $GLOBALS['Session']->requireAccountLevel('Staff');
        
        $responseData = [];
        
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            
            if (!$importFile = $_FILES[static::$uploadFileName]) {                
                return static::throwInvalidRequestError('Error. Import file not found.');
            }
            
            if (!in_array($importFile['type'], static::$validUploadFileTypes)) {
                return static::throwInvalidRequestError('Error. File type is invalid.');
            }
            
#            \MICS::dump($importFile, 'import file', true);
            
            if (isset($_POST['verbose'])) {
                static::$verbose = (boolean)$_POST['verbose'];
            }
            
            if (isset($_POST['pretend'])) {
                static::$pretend = (boolean)$_POST['pretend'];
            }
            
            $ssReader = SpreadsheetReader::createFromFile($importFile['tmp_name']);
            
            $dataFieldMatch = "Data".static::$dynamicFieldPrefix;
            $aliasFieldMatch = "Alias".static::$dynamicFieldPrefix;
            $activityFieldMatch = "Activity";
            
            $sp = "&nbsp;&nbsp;&nbsp;&nbsp;";
            $tab = $sp ." >";
            $dtab = $sp . $sp . ">";
            
            $r = 0;
            
            while ($row = $ssReader->getNextRow()) {
                $r++;
                $assetData = [];
                $aliases = [];

                $log[] = "Analyzing asset.<br>";
                
                $assetData = static::extractDataFromRow($row, $log);
#                \MICS::dump($log, 'asset data', true);
                $Asset = Asset::create($assetData, false);
                
                
                if (static::$verbose === true) {
                    
                    foreach ($Asset->getData() as $f => $v) {
                        $skipFields = array('LocationID', 'StatusID', 'CreatorID', 'Created', 'Data', 'AssigneeClass', 'AssigneeID', 'OwnerClass', 'OwnerID', 'Class', 'Data');
                        if (in_array($f, $skipFields) || !$v) {
                            continue;
                        }
                        
                        $log[] = "$tab Setting $f -> $v";
                    }
                    
                    if (!empty($assetData['relationships'])) {
                        foreach ($assetData['relationships'] AS $relName => $Relationship) {
                            if ($Relationship) {                   
                                $log[] = $tab."Adding $relName: ".$Relationship->Title;
                            } else {
                                $log[] = $tab."No ". $relName ." found for ($value).";
                            }
                        }
                    }
                    
                    if (!$assetData['AssigneeID']) {
                        $log[] = $tab."No assignee found.";
                    }
                    
                    if (!empty($assetData['skipped'])) {
                        $log[] = $tab . "Skipping Fields: ".join(", ", $assetData['skipped']);
                    }
                }
                
                if (static::$pretend === false) {
                    if ($Asset->validate() && !empty($assetData['aliases'])) {                        
                        
                        if (!empty($assetData['comments'])) {
                            foreach ($assetData['comments'] as $comment) {
                                CommentActivity::publish($Asset, 'comment', $GLOBALS['Session']->Person, $comment);
                            }
                        }
                        
                        if (!empty($assetData['relationships'])) {
                            foreach ($assetData['relationships'] AS $relName => $Relationship) {
#                                \MICS::dump(array($relName, $Relationship), 'rel data', true);
                                $Asset->$relName = $Relationship;
                            }
                        }
                        $Asset->save();
                        
                        foreach ($assetData['aliases'] as $alias) {
                            $alias->ObjectID = $Asset->ID;
                            $alias->save(false);
                        }
                        
                        $responseData['data']['createdAssets'][] = $Asset;
                        $log[] = sprintf("$tab Asset saved with ID: %u", $Asset->ID);
                    } else {
                        $responseData['data']['invalidAssets'][] = array_merge(array('RowNumber' => $r), $row);
                        $log[] = sprintf("$tab Invalid asset could not be saved.");
                        foreach ($Asset->getValidationErrors() as $e => $ev) {
                            $log[] = sprintf("$tab $tab Validation Errors:$e : $ev");    
                        }
                        
                    }
                }
                
                $log[] = "<hr>";
            }
            
            if (static::$verbose) {
                $responseData['logs'] = join("<br>", $log);
            }
        }
        
        return static::respond('assets/import', $responseData);
    }
    
    public static function extractDataFromRow(array $rowData, &$log = array())
    {
        
        $dataFieldMatch = "Data".static::$dynamicFieldPrefix;
        $aliasFieldMatch = "Alias".static::$dynamicFieldPrefix;
        $activityFieldMatch = "Activity";
        $assigneeFieldMatch = "Assignee".static::$dynamicFieldPrefix;
        
        $sp = "&nbsp;&nbsp;&nbsp;&nbsp;";
        $tab = $sp ." >";
        $dtab = $sp . $sp . ">";
        
        $assetData = array();
        
        foreach ($rowData as $name => $value) {
            //skip empty rows
            if (empty($name) || empty($value)) {
                continue;
            }
            
            if (strpos($name, $dataFieldMatch) !== false) { //add data fields
                $name = substr($name, (strlen($dataFieldMatch)));
                $assetData['Data'][$name] = $value;
                
                $log[] = $tab . $name ." -> ". $value;
            } else if (strpos($name, $aliasFieldMatch) !== false) { // add aliases
                
                $type = substr($name, (strlen($aliasFieldMatch)));
                if (!$Alias = Alias::getByIdentifier($value, $type)) {
                    $assetData['aliases'][] = Alias::create(array(
                        'Type' => $type,
                        'Identifier' => $value,
                        'ObjectClass' => 'Slate\Assets\Asset'
                    ));
                    $log[] = $tab." Creating new Alias.";
                    $log[] = $dtab. " Type: $type";
                    $log[] = $dtab." Identifier: $value";
                } else {
                    $log[] = $tab." Skipping Alias (Identifier: $value) belongs to $Alias->Object";
                }
            } else if (strpos($name, $activityFieldMatch) !== false) { // add activity notes
                $assetData['comments'][] = $value;
                $log[] = $tab."Adding Comment on asset: $value";
            } else if (array_key_exists($name, Asset::getStackedConfig('fields')) && !in_array($name, array('Created', 'ID', 'CreatorID', 'Class'))) { // add asset fields
                $assetData[$name] = $value;
                $log[] = $tab."Adding Asset $name -> $value";
            } else if (strpos($name, $assigneeFieldMatch) !== false) { //add assignees
                $type = substr($name, (strlen($assigneeFieldMatch)));
                switch ($type) {
                    case 'StudentID':
                        $Relationship = Student::getByField('StudentNumber', $value);
                        break;
                    case 'Email':
                        $Relationship = User::getByField('Email', $value);
                        break;
                    case 'Username':
                        $Relationship = User::getByHandle($value);
                        break;
                    case 'FullName':
                        $names = User::parseFullName($value);
                        $Relationship = User::getByFullName($names['FirstName'], $names['LastName']);
                        break;
                }
                if ($Relationship) {
                    $assetData['AssigneeID'] = $Relationship->ID;
                    $assetData['AssigneeClass'] = ($Relationship->Class instanceof Emergence\People\Person) ? "Person" : $Relationship->Class;
                    $log[] = $tab."Adding Assignee: ".$Relationship->FullName ?: $Relationship;
                }
            } else if(array_key_exists($name, Asset::getStackedConfig('relationships'))) { // add related fields
                if (in_array($value, ['n/a', 'empty', 'null']))
                    continue;

                $log[] = $sp . $sp . $sp . $sp . $name . $sp . $value;
                switch ($name) {
                    case 'Location':
                    case 'Status':
                        $className = ($name == "Status" ?  (__NAMESPACE__ . "\\" ) : ("Emergence\\Locations\\")) . $name ;
                        $relName = $name;
                        $assetData['relationships'][$relName] = $className::getOrCreateByHandle(str_replace(' ', '_', $value), $value);                        
                        break;
                }
            } else { // skip
                $assetData['skipped'][] = $name;
            }
        }
        
        if (!isset($assetData['relationships']['Location']) && !in_array($rowData['Location'], ['n/a', 'empty', 'null'])) {
#            $log[] = "Adding default Location: ".static::$defaultLocation;
            $assetData['relationships']['Location'] = \Emergence\Locations\Location::getOrCreateByHandle(str_replace(' ', '_', static::$defaultLocation), static::$defaultLocation);
        }
        
        if (!isset($assetData['relationships']['Status']) && !in_array($rowData['Status'], ['n/a', 'empty', 'null'])) {
#            $log[] = "Adding default Status: ".static::$defaultStatus;
            $assetData['relationships']['Status'] = \Slate\Assets\Status::getOrCreateByHandle(str_replace(' ', '_', static::$defaultStatus), static::$defaultStatus);
        }
        
        return $assetData;
    }
}