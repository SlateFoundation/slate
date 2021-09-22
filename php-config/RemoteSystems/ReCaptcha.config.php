<?php

/**
 * Obtain site and secret keys from Google by registering
 * at https://www.google.com/recaptcha/admin
 */

RemoteSystems\ReCaptcha::$siteKey = getenv('RECAPTCHA_SITE_KEY');
RemoteSystems\ReCaptcha::$secretKey = getenv('RECAPTCHA_SECRET_KEY');
