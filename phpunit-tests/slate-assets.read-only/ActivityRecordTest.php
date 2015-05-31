<?php

use \ActivityRecord;

class ActivityRecordTest extends PHPUnit_Framework_TestCase
{   
    public static $recordClass = ActivityRecord::class;
    
    public function testFields()
    {
        $RecordClass = static::$recordClass;
        
        $recordFields = $RecordClass::getClassFields();
        
        $expectedFields = array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'CreatorID'
        );
        
#        \Debug::dumpVar(array_keys($recordFields));
        
        $this->assertEquals(array_keys($recordFields), $expectedFields);
    }
    
}