<?php

namespace Slate\People\Merge;

/**
 * Maps a follow-up action Type to the ActionExecutorInterface that can run
 * it in place. Looked up by MergeRequestHandler's execute endpoint, which
 * 404s when a type has no registered executor.
 */
class ActionExecutorRegistry
{
    /** @var array<string, ActionExecutorInterface> */
    protected static array $executors = [];

    public static function register(string $actionType, ActionExecutorInterface $executor): void
    {
        static::$executors[$actionType] = $executor;
    }

    public static function has(string $actionType): bool
    {
        return isset(static::$executors[$actionType]);
    }

    public static function get(string $actionType): ?ActionExecutorInterface
    {
        return static::$executors[$actionType] ?? null;
    }

    /**
     * Test-only: clear all registered executors.
     */
    public static function reset(): void
    {
        static::$executors = [];
    }
}
