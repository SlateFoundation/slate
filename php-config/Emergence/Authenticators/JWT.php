<?php

/**********************************************************************
 * For more information on JSON Web Tokens (JWT) see: https://jwt.io/ *
 **********************************************************************

   You MUST:
     * provide a secretKey in order to use JWT
     * use the same secret to sign tokens as you do to verify them
     * set UserSession::$defaultAuthenticator to Emergence\Authenticators\JWT::class;

   You MAY:
     * Run this from the command line to generate a secret (OSX, Linux):
       date +%s | sha256sum | base64 | head -c 64 ; echo)
 */

# Emergence\Authenticators\JWT::$secretKey = '';
# Emergence\Authenticators\JWT::$urlParameter = 'jwt';
