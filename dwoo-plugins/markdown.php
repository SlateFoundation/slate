<?php

function Dwoo_Plugin_markdown(Dwoo_Core $dwoo, $text, $markdownClass = '\\Michelf\\MarkdownExtra', $autoLinkify = true, $useSmartyPants = true, $smartypantsClass = '\\Michelf\\SmartyPantsTypographer')
{
    #    if($autoLinkify) {
#		// adapted from http://vanillaforums.org/discussion/15567/autolink-with-markdown
#
#		// via http://stackoverflow.com/questions/10002227/linkify-regex-function-php-daring-fireball-method and df
#		$url_regex = '(?xi)\b((?:https?://|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`\!()\[\]{};:\'".,<>?«»“”‘’]))';     
#
#		$text = preg_replace(
#	        '!' . '(^|[^\[\(<"]\s*)' . '(' . $url_regex . ')' . '!',
#	        '$1[$2]($2)',
#	        $text
#    	);
#	}

    $text = $markdownClass::defaultTransform($text);

    if ($useSmartyPants) {
        $text = $smartypantsClass::defaultTransform($text);
    }

    return $text;
}