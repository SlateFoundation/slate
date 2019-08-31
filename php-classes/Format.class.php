<?php

class Format
{
    public static function emailLink($email, $subject=false)
    {
        $mailto = 'mailto:'.$email;

        if ($subject) {
            $mailto .= '?subject='.urlencode($subject);
        }

        return sprintf(
            '<a href="%s">%s</a>'
            ,$mailto
            ,$email
        );
    }

    public static function usPhone($input, $format = '(%s) %s-%s')
    {
        // strip non-digits
        $numbers = preg_replace('/\D/','',$input);

        // strip prefixed 1
        if ((strlen($numbers) == 11) && ($numbers[0] == '1')) {
            $numbers = substr($numbers, 1);
        }

        // return original input if result doesn't make sense
        if (strlen($numbers) != 10) {
            return $input;
        }

        // return formatted string
        return sprintf(
            $format
            , substr($numbers,0,3)
            , substr($numbers,3,3)
            , substr($numbers,6,4)
        );
    }

    public static function truncate($string, $limit=300, $break = '.', $pad = '...')
    {
        // return with no change if string is shorter than $limit
        if (strlen($string) <= $limit) {
            return $string;
        }

        // is $break present between $limit and the end of the string?
        if (false !== ($breakpoint = strpos($string, $break, $limit))) {
            if ($breakpoint < strlen($string) - 1) {
                $string = substr($string, 0, $breakpoint).$pad;
            }
        }

        return $string;
    }

    public static function fuzzyTime($timestamp)
    {
        /*
      if ( !ctype_digit($time) && ( $time = strtotime( $time ) ) == false ) {
        return 'an unknown time';
      }
      define( 'NOW',        time() );
      define( 'ONE_MINUTE', 60 );
      define( 'ONE_HOUR',   3600 );
      define( 'ONE_DAY',    86400 );
      define( 'ONE_WEEK',   ONE_DAY*7 );
      define( 'ONE_MONTH',  ONE_WEEK*4 );
      define( 'ONE_YEAR',   ONE_MONTH*12 );
     
      // sod = start of day :)
      $sod = mktime( 0, 0, 0, date( 'm', $time ), date( 'd', $time ), date( 'Y', $time ) );
      $sod_now = mktime( 0, 0, 0, date( 'm', NOW ), date( 'd', NOW ), date( 'Y', NOW ) );
     
      // used to convert numbers to strings
      $convert = array( 1 => 'one', 2 => 'two', 3 => 'three', 4 => 'four', 5 => 'five', 6 => 'six', 7 => 'seven', 8 => 'eight', 9 => 'nine', 10 => 'ten', 11 => 'eleven' );
     
      // today
      if ( $sod_now == $sod ) {
        if ( $time > NOW-(ONE_MINUTE*3) ) {
          return 'just a moment ago';
        } else if ( $time > NOW-(ONE_MINUTE*7) ) {
          return 'a few minutes ago';
        } else if ( $time > NOW-(ONE_HOUR) ) {
          return 'less than an hour ago';
        }
        return 'today at ' . date( 'g:ia', $time );
      }
     
      // yesterday
      if ( ($sod_now-$sod) <= ONE_DAY ) {
        if ( date( 'i', $time ) > (ONE_MINUTE+30) ) {
          $time += ONE_HOUR/2;
        }
        return 'yesterday around ' . date( 'ga', $time );
      }
     
      // within the last 5 days
      if ( ($sod_now-$sod) <= (ONE_DAY*5) ) {
        $str = date( 'l', $time );
        $hour = date( 'G', $time );
        if ( $hour < 12 ) {
          $str .= ' morning';
        } else if ( $hour < 17 ) {
          $str .= ' afternoon';
        } else if ( $hour < 20 ) {
          $str .= ' evening';
        } else {
          $str .= ' night';
        }
        return $str;
      }
     
      // number of weeks (between 1 and 3)...
      if ( ($sod_now-$sod) < (ONE_WEEK*3.5) ) {
        if ( ($sod_now-$sod) < (ONE_WEEK*1.5) ) {
          return 'about a week ago';
        } else if ( ($sod_now-$sod) < (ONE_DAY*2.5) ) {
          return 'about two weeks ago';
        } else {
          return 'about three weeks ago';
        }
      }
     
      // number of months (between 1 and 11)...
      if ( ($sod_now-$sod) < (ONE_MONTH*11.5) ) {
        for ( $i = (ONE_WEEK*3.5), $m=0; $i < ONE_YEAR; $i += ONE_MONTH, $m++ ) {
          if ( ($sod_now-$sod) <= $i ) {
            return 'about ' . $convert[$m] . ' month' . (($m>1)?'s':'') . ' ago';
          }
        }
      }
     
      // number of years...
      for ( $i = (ONE_MONTH*11.5), $y=0; $i < (ONE_YEAR*10); $i += ONE_YEAR, $y++ ) {
        if ( ($sod_now-$sod) <= $i ) {
          return 'about ' . $convert[$y] . ' year' . (($y>1)?'s':'') . ' ago';
        }
      }
     
      // more than ten years...
      return 'more than ten years ago';
      */

        if (!ctype_digit($timestamp) && ($timestamp = strtotime($timestamp)) == false) {
            echo $timestamp;
            return FALSE;
        }
        $diff = time() - $timestamp;

        $pre = 'a';
        if ($diff < 60) { //Seconds
            return 'less than a minute ago.';
        } elseif ($diff < 3600) { //Minutes
            $val = round(($diff / 60));
            $unit = 'minute';
        } elseif ($diff < 86400) { //Hours
            $val = round(($diff / 3600));
            $unit = 'hour';
            $pre = 'an';
        } elseif ($diff < 604800) { //Days
            $val = round(($diff / 86400));
            $unit = 'day';
        } elseif ($diff < 2592000) { //Weeks
            $val = round(($diff / 604800));
            $unit = 'week';
        } elseif ($diff < 77760000) { //Months (30 Days)
            $val = round(($diff / 2592000));
            $unit = 'month';
        } else {
            $val = round(($diff / 31104000));
            $unit = 'year';
        }
        if ($val>1) {
            return $val.' '.$unit.'s ago';
        } else {
            return $pre.' '.$unit.' ago';
        }
    }

    public static function micsText($text, $mode = 'format')
    {
        // init and configure BBcode engine
        if (!isset($GLOBALS['bbcodeEngine'])) {
            function bbcode_clean_list($text)
            {
                return preg_replace("/[\r\n]/",'',$text);
            }

            $GLOBALS['bbcodeEngine'] = bbcode_create(array(
                '' => array('type'=>BBCODE_TYPE_ROOT,  'childs'=>'!*')
                ,'h2' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<h2>', 'close_tag'=>'</h2>')
                ,'h3' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<h3>', 'close_tag'=>'</h3>')
                ,'h4' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<h4>', 'close_tag'=>'</h4>')
                ,'h5' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<h5>', 'close_tag'=>'</h5>')
                ,'h6' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<h6>', 'close_tag'=>'</h6>')
                ,'i' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<i>', 'close_tag'=>'</i>')
                ,'cite' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<cite>', 'close_tag'=>'</cite>')
                ,'b' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<b>', 'close_tag'=>'</b>')
                ,'u' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<u>', 'close_tag'=>'</u>')
                ,'s' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<s>', 'close_tag'=>'</s>')
                ,'small' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<small>', 'close_tag'=>'</small>')
                ,'quote' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<blockquote>', 'close_tag'=>'</blockquote>')
                ,'sig' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<div class="sig">', 'close_tag'=>'</div>')
                ,'url' => array('type'=>BBCODE_TYPE_OPTARG, 'open_tag'=>'<a href="{PARAM}" target="_blank">', 'close_tag'=>'</a>', 'default_arg'=>'{CONTENT}', 'childs'=>'b,i')
                ,'img' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<img src="', 'close_tag'=>'" />', 'childs'=>'')
                ,'list'=> array(
                    'type' => BBCODE_TYPE_NOARG
                    ,'open_tag' => '<ul>'
                    ,'close_tag' => '</ul>'
                    ,'childs' => '*'
                    ,'content_handling' => 'bbcode_clean_list'
                )
                ,'*' => array('type'=>BBCODE_TYPE_NOARG, 'open_tag'=>'<li>', 'close_tag'=>'</li>', 'parent'=>'list', 'flags'=>BBCODE_FLAGS_ONE_OPEN_PER_LEVEL)
                ,'l' => array('type'=>BBCODE_TYPE_SINGLE, 'open_tag' => '[')
                ,'r' => array('type'=>BBCODE_TYPE_SINGLE, 'open_tag' => ']')
            ));
        }

        if ($mode == 'strip') {
            return preg_replace('/\[[^\[]+\]/', '', htmlspecialchars($text));
        } else {
            // block elements
            $blockEls = 'h[1-6]|ul';

            // encode and parse bbcode
            $text = @bbcode_parse($GLOBALS['bbcodeEngine'], htmlspecialchars($text));

            // pad block elements with double newlines to break paragraphs
            $text = preg_replace('/\s*<('.$blockEls.')>(.*?)<\/\1>\s*/i', "\n\n<\$1>\$2</\$1>\n\n", $text);

            // trim ends
            $text = trim($text);

            // replace 4+ dashes with <hr>
            $text = preg_replace('/-{4,}/i', '<hr />', $text);

            // turn 2+ newlines into paragraphs
            $text = '<p>'.preg_replace('/\s*\n\s*\n\s*/', '</p><p>', $text).'</p>';

            // remove paragraphs and newlines wrapping block-level elements
            $text = preg_replace('/\s*<p>\s*<('.$blockEls.')>(.*?)<\/\1>\s*<\/p>\s*/i', '<$1>$2</$1>', $text);

            // simple character replacements
            $text = str_replace(array('--','(r)','(tm)','(c)'), array('&mdash;','&reg;','&trade;','&copy;'), $text);

            // ordinals
            $text = preg_replace('/(\d+)(st|nd|rd|th|st)\b/i', '$1<sup>$2</sup>',$text);

            // turn remaining single newlines into brs
            $text = nl2br($text);

            return $text;
        }
    }

    public static function twitterText($text)
    {
        $autoLink = new Twitter_Autolink();
        return $autoLink->autoLink($text);
    }
}