<?php

function Dwoo_Plugin_format_text(Dwoo_Core $dwoo, $text, $format = 'plain', $mode = 'format')
{
    switch ($format) {
        case 'html':
        {
            if ($mode == 'strip') {
                return strip_tags($text);
            } else {
                return $text;
            }
        }

        case 'micstext':
        {
            // load plugin
            if (function_exists('Dwoo_Plugin_micstext') === false) {
                $dwoo->getLoader()->loadPlugin('micstext');
            }

            return Dwoo_Plugin_micstext($dwoo, $text, $mode);
        }

        default:
        case 'plain':
        {
            return nl2br(htmlspecialchars($text));
        }

    }
}


?>