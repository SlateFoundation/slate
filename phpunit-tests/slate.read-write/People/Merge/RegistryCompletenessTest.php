<?php

namespace Slate\TestsRW\People\Merge;

use Slate\People\Merge\RegistryCompletenessCheck;

/**
 * The registry-completeness check from
 * specs/behaviors/person-merge.md#verification: an information_schema scan
 * for person-keyed columns not covered by MergeRegistry. Requires a live DB
 * via the full Emergence/Slate runtime.
 */
class RegistryCompletenessTest extends \PHPUnit_Framework_TestCase
{
    public function testNoUnregisteredPersonKeyedColumns()
    {
        $unregistered = RegistryCompletenessCheck::findUnregisteredColumns();

        $this->assertEmpty(
            $unregistered,
            'Unregistered person-keyed columns found (see RegistryCompletenessCheck::PERSON_COLUMN_NAMES for the scan '
            .'pattern and MergeRegistry to register them): '.json_encode($unregistered)
        );
    }
}
