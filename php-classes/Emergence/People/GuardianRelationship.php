<?php

namespace Emergence\People;

use DB;

class GuardianRelationship extends Relationship
{
    public static function getWardIds(IPerson $Guardian)
    {
        static $cache = [];
        $wardIds = &$cache[$Guardian->ID];

        if ($wardIds === null) {
            $wardIds = array_map(
                'intval',
                DB::allValues(
                    'PersonID',
                    'SELECT PersonID FROM `%s` WHERE %s',
                    [
                        static::$tableName,
                        implode(
                            ' AND ',
                            static::mapConditions([
                                'Class' => static::class,
                                'RelatedPersonID' => $Guardian->ID,
                            ])
                        )
                    ]
                )
            );
        }

        return $wardIds;
    }
}
