<?php

namespace Emergence\Mailer;

class PHPMailer extends AbstractMailer
{
    public static function send($to, $subject, $body, $from = false, $options = array())
    {
        if (!$from) {
            $from = static::getDefaultFrom();
        }

        // assemble headers into string
        if (empty($options['Headers'])) {
            $headers = '';
        } elseif (is_array($options['Headers'])) {
            $headers = '';
            foreach ($options['Headers'] AS $key => $value) {
                if (is_string($key)) {
                    $headers .= $key.': '.$value.PHP_EOL;
                } else {
                    $headers .= $value.PHP_EOL;
                }
            }
        } elseif (is_string($options['Headers'])) {
            $headers = $options['Headers'];
        }

        // get sendmail params
        $sendmailParams = !empty($options['SendmailParams']) ? $options['SendmailParams'] : '-t -i';

        // implode to addresses if array was provided
        if (is_array($to)) {
            $to = implode(', ', $to);
        }


        if ($from) {
            $headers .= "From: $from".PHP_EOL;

            $fromAddress = preg_replace('/^[^<]*<([^>]+)>?$/', '$1', $from);
            $sendmailParams .= sprintf(' -f%1$s -F%1$s', $fromAddress);
        }

        $headers .= 'MIME-Version: 1.0'.PHP_EOL;
        $headers .= 'Content-Type: text/html; charset=utf-8'.PHP_EOL;
        $headers .= 'Content-Transfer-Encoding: base64'.PHP_EOL;

        return @mail($to, $subject, chunk_split(base64_encode($body)), $headers, $sendmailParams);
    }
}