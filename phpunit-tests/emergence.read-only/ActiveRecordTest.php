<?php declare(strict_types=1);

final class ActiveRecordTest extends PHPUnit\Framework\TestCase
{
    public static function setUpBeforeClass(): void
    {
        require('src/TestRecord.php');
    }

    public function testFields(): void
    {
        $fields = TestRecord::getClassFields();
        $this->assertEquals(array_keys($fields), array('ID', 'Class', 'Created', 'CreatorID', 'Field1', 'Field2', 'NullableDefault', 'NotNullableDefault'), 'check class fields list');
    }

    public function testDefaults(): void
    {
        $Record = new TestRecord();

        $this->assertEquals(1, $Record->NullableDefault, 'unset nullable value returns default');
        $this->assertNull($Record->NullableDefault = null, 'nullable value set to null');
        $this->assertNull($Record->NullableDefault, 'nullable value previously set explicitely to null returns null');

        $this->assertEquals(1, $Record->NotNullableDefault, 'unset non-nullable value returns default');
        $this->assertNull($Record->NotNullableDefault = null, 'non-nullable value set to null');
        $this->assertEquals(0, $Record->NotNullableDefault, 'non-nullable value previously set explicitely to null returns null');
        $this->assertEquals(1, $Record->NotNullableDefault = 1, 'non-nullable value set to 1');
        $this->assertEquals(1, $Record->NotNullableDefault, 'non-nullable value previously set explicitely to 1 returns 1');
    }
}