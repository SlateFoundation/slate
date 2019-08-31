<?php


class Email
{
    public static $defaultFrom;

    public static function getDefaultFrom()
    {
        if (empty(static::$defaultFrom)) {
            static::$defaultFrom = 'hello@'.Site::getConfig('primary_hostname');
        }

        return static::$defaultFrom;
    }

    public static function send($to, $subject, $body, $from = false, $headers = '', $sendmailParams = '-t -i')
    {
        if (!$from) {
            $from = static::getDefaultFrom();
        }

        if (is_array($headers)) {
            $headers = implode(PHP_EOL, $headers).PHP_EOL;
        }

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

        return @mail($to, $subject, $body, $headers, $sendmailParams);
    }

    public static function sendWithAttachments($to, $subject, $body, $attachments, $from = false, $headers = '', $sendmailParams = '-t -i')
    {
        if (!$from) {
            $from = static::getDefaultFrom();
        }

        if (is_array($headers)) {
            $headers = implode(PHP_EOL, $headers).PHP_EOL;
        }

        if (is_array($to)) {
            $to = implode(', ', $to);
        }

        if ($from) {
            $headers .= "From: $from".PHP_EOL;

            $fromAddress = preg_replace('/^[^<]*<([^>]+)>?$/', '$1', $from);
            $sendmailParams .= sprintf(' -f%1$s -F%1$s', $fromAddress);
        }

        $mimeBoundary = '==Multipart_Boundary_x'.md5(time()).'x';

        $headers .= 'MIME-Version: 1.0'.PHP_EOL;
        $headers .= 'Content-Type: multipart/mixed; boundary="'.$mimeBoundary.'"'.PHP_EOL;

        // plain text version
        $data = strip_tags($body).PHP_EOL.PHP_EOL;
        $data .= '--'.$mimeBoundary.PHP_EOL;

        // html version
        $data .= 'Content-Type: text/html; charset=utf-8'.PHP_EOL;
        $data .= 'Content-Transfer-Encoding: 7bit'.PHP_EOL.PHP_EOL;
        $data .= $body.PHP_EOL.PHP_EOL;
        $data .= '--'.$mimeBoundary.PHP_EOL;

        // attachments
        foreach ($attachments AS $filename => $contents) {
            $cleanFilename = str_replace('"','',$filename);
            $mimeType = File::getMIMETypeFromContents($contents);
            $data .= "Content-Type: $mimeType; name=\"$cleanFilename\"".PHP_EOL;
            $data .= "Content-Disposition: attachment; filename=\"$cleanFilename\"".PHP_EOL;
            $data .= 'Content-Transfer-Encoding: base64'.PHP_EOL.PHP_EOL;
            $data .= chunk_split(base64_encode($contents)).PHP_EOL.PHP_EOL;
            $data .= '--'.$mimeBoundary.PHP_EOL;
        }

        return @mail($to, $subject, $data, $headers, $sendmailParams);
    }

    public static function removeReplyQuote($messageBody)
    {
        /*
        *   Remove's email reply quote.
        *   Return's leftover body if quote is extracted. Returns same string if no quote is extracted.
        *   Currently supports Gmail and AOL
         *  Try using this awesome tool to create more regex' : http://www.txt2re.com/index-php.php3
         */


        /* URL that generated this regex:
         *  http://www.txt2re.com/index-php.php3?s=On%20Tue,%20Aug%2031,%202010%20at%2012:43%20AM,%20YouGee.com%20%3Chello@yougee.me%3E%20wrote:&-137&-157&-103&20&-113&21&-105&33&-36&-114&-106&19&-107&-37&-108&7&-115&-110&-9&-116&-24&-111&3&-131&-112&-15&-129
         * First line of Gmail reply quote example:
         * 'On Tue, Aug 31, 2010 at 12:43 AM, YouGee.com <hello@yougee.me> wrote:';
         * 			  Regex Specific to this  ^^^^^^^^^^
        */

        $re1='(On)';    # Word 1
        $re2='( )';    # Any Single Character 1
        $re3='((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Tues|Thur|Thurs|Sun|Mon|Tue|Wed|Thu|Fri|Sat))';    # Day Of Week 1
        $re4='(,)';    # Any Single Character 2
        $re5='( )';    # Any Single Character 3
        $re6='((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Sept|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?))';    # Month 1
        $re7='( )';    # Any Single Character 4
        $re8='((?:(?:[0-2]?\\d{1})|(?:[3][0,1]{1})))(?![\\d])';    # Day 1
        $re9='(,)';    # Any Single Character 5
        $re10='( )';    # Any Single Character 6
        $re11='((?:(?:[1]{1}\\d{1}\\d{1}\\d{1})|(?:[2]{1}\\d{3})))(?![\\d])';    # Year 1
        $re12='( )';    # Any Single Character 7
        $re13='(at)';    # Word 2
        $re14='( )';    # Any Single Character 8
        $re15='((?:(?:[0-1][0-9])|(?:[2][0-3])|(?:[0-9])):(?:[0-5][0-9])(?::[0-5][0-9])?(?:\\s?(?:am|AM|pm|PM))?)';    # HourMinuteSec 1
        $re16='(,)';    # Any Single Character 9
        $re17='( )';    # Any Single Character 10
        $re18='(YouGee)';    # Word 3
        $re19='(\\.)';    # Any Single Character 11
        $re20='(com)';    # Word 4
        $re21='( )';    # Any Single Character 12
        $re22='(<)';    # Any Single Character 13
        $re23='([\\w-+]+(?:\\.[\\w-+]+)*@(?:[\\w-]+\\.)+[a-zA-Z]{2,7})';    # Email Address 1
        $re24='(>)';    # Any Single Character 14
        $re25='( )';    # Any Single Character 15
        $re26='(wrote)';    # Word 5
        $re27='(:)';    # Any Single Character 16

        $GmailRegex = "/".$re1.$re2.$re3.$re4.$re5.$re6.$re7.$re8.$re9.$re10.$re11.$re12.$re13.$re14.$re15.$re16.$re17.$re18.$re19.$re20.$re21.$re22.$re23.$re24.$re25.$re26.$re27."/is";


        $delimiter = '***THROW AWAY BELOW***';

        // clients' check
        if ($messageBody != preg_replace($GmailRegex, $delimiter ,$messageBody)) {
            // Gmail check
            $messageBody = preg_replace($GmailRegex, $delimiter ,$messageBody);
            $endPos = strpos($messageBody, $delimiter);
            $messageBody = substr($messageBody, 0, $endPos);
        } elseif (strpos($body, '-----Original Message-----')) {
            // AOL check
            $startPos = strpos($messageBody, '-----Original Message-----');
            $messageBody = substr($messageBody, 0, $startPos);
        }
/*      elseif
        {
            // add more email client checks
        }
*/

        return $messageBody;
    }
}