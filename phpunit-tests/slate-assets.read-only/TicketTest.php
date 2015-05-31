<?php

use Slate\Assets\Ticket;

class TicketTest extends PHPUnit_Framework_TestCase
{   
    public static $recordClass = Slate\Assets\Ticket::class;
    
    public function testFields()
    {
        $RecordClass = static::$recordClass;
        
        $recordFields = $RecordClass::getClassFields();
        
        $expectedFields = array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'CreatorID',
            4 => 'AssetID',
            5 => 'Status',
            6 => 'AssigneeID',
            7 => 'Type',
            8 => 'Description',
            9 => 'Name'
        );
        
#        \Debug::dumpVar(array_keys($fields));
        
        $this->assertEquals(array_keys($recordFields), $expectedFields);
    }
    
    public function testParentClass()
    {
        $recordClass = static::$recordClass;
        
        $Record = new $recordClass();  
        
        $this->assertEquals(true, is_a($Record, "ActivityRecord"));
    }
    
}