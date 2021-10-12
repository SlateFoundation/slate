<?php

namespace Emergence\Mailer;

Mailer::$defaultFrom
    = getenv('MAILER_DEFAULT_FROM')
    ?: null;
