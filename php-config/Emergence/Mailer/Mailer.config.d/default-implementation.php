<?php

namespace Emergence\Mailer;

Mailer::$defaultImplementation
    = getenv('MAILER_DEFAULT_IMPLEMENTATION')
    ?: PHPMailer::class;
