<?php

// See http://slate.is/docs/integrations/general/saml2

/**
 * Should start with: -----BEGIN RSA PRIVATE KEY-----
 */
Emergence\SAML2\Connector::$privateKey = getenv('SAML2_PRIVATE_KEY');

/**
 * Should start with: -----BEGIN CERTIFICATE-----
 */
Emergence\SAML2\Connector::$certificate = getenv('SAML2_CERTIFICATE');
