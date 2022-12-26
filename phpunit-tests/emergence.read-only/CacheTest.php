<?php declare(strict_types=1);

final class CacheTest extends PHPUnit\Framework\TestCase
{
    public function testCache()
    {
        $this->assertFalse(Cache::fetch('test_key'), 'false for non-existent key');
        $this->assertTrue(Cache::store('test_key', 'value'), 'set a value');
        $this->assertEquals('value', Cache::fetch('test_key'), 'value is set');
        $this->assertTrue(Cache::store('null_key', null), 'set a null value');
        $this->assertNull(Cache::fetch('null_key'), 'null value is set');
        $this->assertTrue(Cache::exists('test_key', null), 'value exists');
        $this->assertTrue(Cache::exists('null_key', null), 'null value exists');
        $this->assertFalse(Cache::exists('unset_key', null), 'unset value does not exist');
        $this->assertTrue(Cache::delete('test_key', null), 'delete value');
        $this->assertFalse(Cache::exists('test_key', null), 'deleted value does not exist');

        $this->assertEquals(1, Cache::increase('counter_key'), 'counter initializes to 1');
        $this->assertEquals(2, Cache::increase('counter_key'), 'counter increases to 2');
        $this->assertEquals(1, Cache::decrease('counter_key'), 'counter decreases to 1');

        $this->assertEquals(-1, Cache::decrease('negative_counter_key'), 'counter initialized to -1');
    }
}