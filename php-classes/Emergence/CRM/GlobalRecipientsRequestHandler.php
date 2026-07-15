<?php

declare(strict_types=1);

namespace Emergence\CRM;

class GlobalRecipientsRequestHandler extends \RecordsRequestHandler
{
    public static $recordClass = GlobalRecipient::class;
    public static $browseOrder = ['Title' => 'ASC'];
}
