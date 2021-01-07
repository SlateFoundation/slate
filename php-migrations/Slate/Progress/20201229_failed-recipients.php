<?php

namespace Slate\Progress;

$status = static::STATUS_SKIPPED;

if (
    static::tableExists(SectionInterimReportRecipient::$tableName)
    && !static::hasColumnEnumValue(SectionInterimReportRecipient::$tableName, 'Status', 'failed')
) {
    printf("Adding 'failed' value to Status column in table %s\n", SectionInterimReportRecipient::$tableName);
    static::addColumnEnumValue(SectionInterimReportRecipient::$tableName, 'Status', 'failed');
    $status = static::STATUS_EXECUTED;
}

if (
    static::tableExists(SectionTermReportRecipient::$tableName)
    && !static::hasColumnEnumValue(SectionTermReportRecipient::$tableName, 'Status', 'failed')
) {
    printf("Adding 'failed' value to Status column in table %s\n", SectionTermReportRecipient::$tableName);
    static::addColumnEnumValue(SectionTermReportRecipient::$tableName, 'Status', 'failed');
    $status = static::STATUS_EXECUTED;
}

return $status;
