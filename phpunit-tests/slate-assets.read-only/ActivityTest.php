<?php

use \Activity;

class ActivityTest extends PHPUnit_Framework_TestCase
{   
    public static $recordClass = Activity::class;
    
    public function testFields()
    {
        $RecordClass = static::$recordClass;
        
        $recordFields = $RecordClass::getClassFields();
        
        $expectedFields =array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'ActorClass',
            4 => 'ActorID',
            5 => 'Verb',
            6 => 'ObjectClass',
            7 => 'ObjectID',
            8 => 'Data'
        );
        
#        \Debug::dumpVar(array_keys($recordFields));
        
        $this->assertEquals(array_keys($recordFields), $expectedFields);
    }
    
    public function testSubClasses()
    {
        $RecordClass = static::$recordClass;
        
        $rootClass = $RecordClass::getStaticRootClass();
        
        $expectedClasses = array (
            0 => 'DeltaActivity',
            1 => 'CommentActivity',
            2 => 'MediaActivity',
        );
        
#        \Debug::dumpVar($rootClass::getStaticSubClasses());
        $this->assertEquals($expectedClasses, $rootClass::getStaticSubClasses());
    }
    
}