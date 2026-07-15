<?php

declare(strict_types=1);

namespace Slate\Progress;

class SectionTermReportsRequestHandler extends AbstractSectionTermReportsRequestHandler
{
    public static $recordClass = SectionTermReport::class;
    public static $recipientClass = SectionTermReportRecipient::class;
}
