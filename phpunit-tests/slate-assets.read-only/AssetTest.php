<?php

use Slate\Assets\Asset;

class AssetTest extends PHPUnit_Framework_TestCase
{   
    
    public static $recordClass = Slate\Assets\Asset::class;
    
    public function testFields()
    {
        $RecordClass = static::$recordClass;
        
        $recordFields = $RecordClass::getClassFields();
        
        $expectedFields = array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'CreatorID',
            4 => 'Name',
            5 => 'OwnerClass',
            6 => 'OwnerID',
            7 => 'AssigneeClass',
            8 => 'AssigneeID',
            9 => 'LocationID',
            10 => 'StatusID',
            11 => 'Data'
        );
        
#        \Debug::dumpVar(array_keys($recordFields));
        
        $this->assertEquals(array_keys($recordFields), $expectedFields);
    }
    
    public function testRequiredClasses()
    {
        $RequiredClasses = static::$requiredClasses;
        
        foreach ($RequiredClasses as $RequiredClass) {
            $RequiredClass = new $RequiredClass();
        }
    }
    
}