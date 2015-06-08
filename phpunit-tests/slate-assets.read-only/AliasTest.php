<?php

use Slate\Assets\Alias;

class AliasTest extends PHPUnit_Framework_TestCase
{   
    public static $recordClass = Slate\Assets\Alias::class;
    
    public function testFields()
    {
        $RecordClass = static::$recordClass;
        
        $recordFields = $RecordClass::getClassFields();
        
        $expectedFields = array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'CreatorID',
            4 => 'Type',
            5 => 'Identifier',
            6 => 'ObjectClass',
            7 => 'ObjectID'
        );
        
#        \Debug::dumpVar(array_keys($recordFields));
        
        $this->assertEquals(array_keys($recordFields), $expectedFields);
    }
    
    public function testParentClass()
    {
        $recordClass = static::$recordClass;
        
        $Record = new $recordClass();  
        
        $this->assertEquals(true, is_a($Record, "ActivityRecord"));
    }
    
    
}