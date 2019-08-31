<?php

namespace Emergence\Util;

class Capitalizer
{
    public static $familyNamePrefixes = array(
        'Mc',
        'Mac',
        'Van',
        // these don't work consistently:
#        'De',
#        'Di',
    );

    public static function capitalizePronoun($word, $familyName = false)
    {
        $me = get_called_class();
        $_recurse = function($word) use ($me, $familyName) {
            return $me::capitalizePronoun($word, $familyName);
        };

        if (preg_match('/^[ea]l-\pL/u', $word)) {
            // el- / al- prefixes stay lowercase
            return strtolower(substr($word, 0, 2)).'-'.static::capitalizePronoun(substr($word, 3));
        } elseif (strpos($word, '-') !== false) {
            // process hyphenated-separated bits independently
            return implode('-', array_map($_recurse, explode('-', $word)));
        }

        if (strpos($word, ' ') !== false) {
            // process space-separated bits independently
            return implode(' ', array_map($_recurse, explode(' ', $word)));
        }

        if (strpos($word, '\'') !== false) {
            // process apostrophe-separated bits independently
            return implode('\'', array_map($_recurse, explode('\'', $word)));
        }

        if (strpos($word, '.') !== false) {
            // process .-separated bits independently
            return implode('.', array_map($_recurse, explode('.', $word)));
        }

        // roman numerals (only detects 1-14) should be all caps
        if (preg_match('/^(i{1,3}|i?vi{0,3}|i?xi{0,3})$/i', $word)) {
            return strtoupper($word);
        }

        // start out all-lowercase
        $word = strtolower($word);

        // first letter always capitalized
        $word = ucfirst($word);

        // handly family name prefixes
        if ($familyName) {
            foreach (static::$familyNamePrefixes AS $prefix) {
                if (strpos($word, $prefix) === 0) {
                    $prefixLen = strlen($prefix);

                    if (
                        // skip if a double letter follows the prefix (e.g. Derry)
                        !preg_match('/^([a-z])\1/', substr($word, $prefixLen)) &&

                        // skip if only one letter is left after the prefix
                        strlen($word) > $prefixLen + 1
                    ) {
                        $word = substr($word, 0, $prefixLen).ucfirst(substr($word, $prefixLen));
                    }
                    break;
                }
            }
        }

        return $word;
    }
}