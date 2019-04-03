<?php

namespace Emergence\CRM;

class GlobalRecipientsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = GlobalRecipient::class;
    public static $browseOrder = ['Title' => 'ASC'];
}