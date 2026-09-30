<?php

namespace Slate\TestsRW\Connectors\Canvas;

use Exception;
use Emergence\People\IPerson;
use Psr\Log\LoggerInterface;

/**
 * Stands in for the real Canvas connector package's
 * Slate\Connectors\Canvas\Connector (composed above this repo, absent
 * here) so UserMergeExecutor's pretend-mode sync verification can be
 * exercised: point UserMergeExecutor::$connectorClass at this class.
 * Same pushUser() signature as the real connector.
 */
class FakeCanvasConnector
{
    /** @var array<int, array{0: IPerson, 1: bool}> [person, pretend] per call */
    public static array $pushUserCalls = [];

    public static ?string $throwMessage = null;

    public static function reset(): void
    {
        static::$pushUserCalls = [];
        static::$throwMessage = null;
    }

    public static function pushUser(IPerson $User, ?LoggerInterface $logger = null, $pretend = true)
    {
        static::$pushUserCalls[] = [$User, $pretend];

        if (static::$throwMessage !== null) {
            throw new Exception(static::$throwMessage);
        }

        return null;
    }
}
