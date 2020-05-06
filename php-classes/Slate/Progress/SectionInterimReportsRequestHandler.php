<?php

namespace Slate\Progress;


class SectionInterimReportsRequestHandler extends AbstractSectionTermReportsRequestHandler
{
    public static $recordClass = SectionInterimReport::class;
    public static $recipientClass = SectionInterimReportRecipient::class;
}