<?php

namespace Emergence\Mailer;

interface IMailer
{
    public static function send($to, $subject, $body, $from = false);
    public static function sendFromTemplate($to, $template, $data = array(), $options = array());
    public static function renderTemplate($template, $data = array());
}