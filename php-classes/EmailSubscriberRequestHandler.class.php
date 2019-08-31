<?php

class EmailSubscriberRequestHandler extends RequestHandler
{
    public static $onSubscribe;

    public static function handleRequest()
    {

        // handle JSON requests
        if (static::peekPath() == 'json') {
            static::$responseMode = static::shiftPath();
        }

        // route request
        return static::handleSubscriberRequest();
    }

    public static function handleSubscriberRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            // save to database
            $Submission = new EmailSubscriber::$defaultClass();
            $Submission->Name = $_REQUEST['Name'];
            $Submission->Email = $_REQUEST['Email'];

            if (!$Submission->validate()) {
                // respond invalid
                return static::respond('emailSubscriberInvalid', array(
                    'success' => false
                ));
            } else {
                try {
                    $Submission->save();

                    if (static::$onSubscribe) {
                        call_user_func(static::$onSubscribe, $Submission, $_REQUEST);
                    }

                    // respond success
                    return static::respond('emailSubscriberSubmitted', array(
                        'success' => true
                    ));
                } catch (DuplicateKeyException $e) {
                    // respond invalid
                    return static::respond('emailSubscriberExisting', array(
                        'success' => false
                    ));
                }
            }
        }

        return static::respond('emailSubscriber');
    }
}