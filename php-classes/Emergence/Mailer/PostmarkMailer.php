<?php

namespace Emergence\Mailer;

class PostmarkMailer extends AbstractMailer
{
    public static $apiKey = '';

    public static function send($to, $subject, $body, $from = false, $options = array())
    {
        if (!$from) {
            $from = static::getDefaultFrom();
        }

        return static::apiPost(array_merge($options, array(
            'To' => $to
            ,'From' => $from
            ,'Subject' => $subject
            ,'HtmlBody' => $body
        )));
    }


    protected static function apiPost($data)
    {
        $ch = curl_init('https://api.postmarkapp.com/email');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json'
            ,'Accept: application/json'
            ,'X-Postmark-Server-Token: '.static::$apiKey
        ));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        if ($data) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $result = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
#		die("<hr>result: $result, status: $httpStatus<hr>");

        if ($httpStatus == 200) {
            return json_decode($result, true);
        } else {
            \Emergence\Logger::general_error('PostmarkMailer Delivery Error', [
                'exceptionClass' => \PostmarkMailer::class,
                'exceptionMessage' => $result,
                'exceptionCode' => $httpStatus
            ]);

            return false;
        }
    }
}
