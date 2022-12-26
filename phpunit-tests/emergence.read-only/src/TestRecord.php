<?php

class TestRecord extends ActiveRecord
{
    public static $fields = array(
        'Field1',
        'Field2',
        'NullableDefault' => array(
            'type' => 'int',
            'notnull' => false,
            'default' => 1
        ),
        'NotNullableDefault' => array(
            'type' => 'int',
            'notnull' => true,
            'default' => 1
        )
    );
}