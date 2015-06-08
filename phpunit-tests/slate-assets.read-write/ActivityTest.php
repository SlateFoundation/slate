<?php

#use ActivityRecord;

class ActivityTest extends PHPUnit_Framework_TestCase
{   
    
    //load ActivityRecord
#    public function setUp()
#    {
#        ActivityRecord
#    }
    
    public function testFields()
    {
        $fields = ActivityRecord::getClassFields();
        
        $activityFields = array (
            0 => 'ID',
            1 => 'Class',
            2 => 'Created',
            3 => 'CreatorID'
        );
        
        $this->assertEquals(array_keys($fields), $activityFields);
    }
    
#    public function testActivity()
#    {
#        
#    }
    
}