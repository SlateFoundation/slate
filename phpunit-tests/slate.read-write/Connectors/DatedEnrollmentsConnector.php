<?php

namespace Slate\TestsRW\Connectors;

/**
 * The Google Sheets connector with enrollment start and end date columns
 * mapped, the way a deployment maps them. Stock Slate maps neither, so an
 * import's dates can only be exercised through a subclass like this one.
 */
class DatedEnrollmentsConnector extends \Slate\Connectors\GoogleSheets\Connector
{
    public static $enrollmentColumns = [
        'Start Date' => 'StartDate',
        'End Date' => 'EndDate',
    ];
}
