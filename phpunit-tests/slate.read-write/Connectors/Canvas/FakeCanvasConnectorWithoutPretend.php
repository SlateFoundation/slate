<?php

namespace Slate\TestsRW\Connectors\Canvas;

use Emergence\People\IPerson;

/**
 * A connector whose pushUser() has no `$pretend` parameter -- i.e. one that
 * could only ever sync for real. UserMergeExecutor must never call it.
 */
class FakeCanvasConnectorWithoutPretend
{
    public static int $pushUserCalls = 0;

    public static function pushUser(IPerson $User)
    {
        static::$pushUserCalls++;

        return null;
    }
}
