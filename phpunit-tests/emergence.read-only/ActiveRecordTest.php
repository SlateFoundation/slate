<?php

class ActiveRecordTest extends PHPUnit_Framework_TestCase
{
    protected function setUp()
    {
        require('src/TestRecord.php');
    }

    public function testFields()
    {
        $fields = TestRecord::getClassFields();
        $this->assertEquals(array_keys($fields), array('ID', 'Class', 'Created', 'CreatorID', 'Field1', 'Field2'));
    }
}