<?php

namespace Emergence\Mailer;

class Mailgun extends AbstractMailer
{
    public static $domain;
    public static $apiKey;

    public static function send($to, $subject, $body, $from = false, array $options = [])
    {
        if (!$from) {
            $from = static::getDefaultFrom();
        }

        return static::apiPost(array_merge($options, [
            'to' => $to,
            'from' => $from,
            'subject' => $subject,
            'html' => $body
        ]));
    }

    protected static function apiPost(array $data)
    {
        $ch = curl_init('https://api.mailgun.net/v3/'.static::$domain.'/messages');

        curl_setopt($ch, CURLOPT_USERPWD, 'api:'.static::$apiKey); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        $result = curl_exec($ch);
        $httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpStatus == 200) {
            return json_decode($result, true);
        } else {
            \Emergence\Logger::general_error('Mailgun Delivery Error', [
                'exceptionClass' => static::class,
                'exceptionMessage' => $result,
                'exceptionCode' => $httpStatus
            ]);

            return false;
        }
    }
}
