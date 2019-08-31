<?php

class TokensRequestHandler extends RequestHandler
{
    public static function handleRequest()
    {
        // handle json response mode
        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        }

        // get token
        if (!$tokenHandle = static::shiftPath()) {
            return static::throwInvalidRequestError();
        }

        if (!$Token = Token::getByHandle($tokenHandle)) {
            return static::throwNotFoundError();
        }

        if ($Token->isUsed) {
            return static::throwError('Token has already been used. Please try again.');
        }

        if ($Token->isExpired) {
            return static::throwError('Token has expired. Please try again.');
        }


        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            try {
                $Token->handleRequest($_REQUEST);
            } catch (Exception $e) {
                $error = $e->getMessage();

                if (!$error) {
                    throw $e;
                }
            }
        }

        $tokenClass = $Token->Class;
        return static::respond($tokenClass::$formTemplate, array(
            'Token' => $Token
            ,'error' => isset($error) ? $error : false
        ));
    }
}