<?php

namespace Slate\Progress;


class SectionTermReportsRequestHandler extends AbstractSectionTermReportsRequestHandler
{
    public static $recordClass = SectionTermReport::class;
    public static $recipientClass = SectionTermReportRecipient::class;
}