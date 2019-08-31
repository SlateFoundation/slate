<?php

namespace Emergence;

use Site;
use Cache;
use Emergence_FS;

class Locale
{
    public static $default = 'en_US.utf8';
    protected static $_requestedLocale;

    /**
     * Gets locale that should be used for the current request, based on
     * 1) locale cookie, get param, or post param
     * 2) Accept-Language header
     * 3) $default setting
     *
     * Accept-language parsing is currently much simpler than it should be, q values and prefixes are ignored
     */
    public static function getRequestedLocale()
    {
        if (static::$_requestedLocale) {
            return static::$_requestedLocale;
        }

        $availableLocales = static::getAvailableLocales();

        // prefer user-selected locale
        if (
            (
                (
                    !empty($_GET['locale']) &&
                    ($requestedLocale = static::normalizeLocaleName($_GET['locale']))
                ) ||
                (
                    !empty($_COOKIE['locale']) &&
                    ($requestedLocale = static::normalizeLocaleName($_COOKIE['locale']))
                )
            ) &&
            in_array($requestedLocale, $availableLocales)
        ) {
            return static::$_requestedLocale = $requestedLocale;
        }

        // find matching locale from Accept-Language header
        foreach (preg_split('/\s*,\s*/', $_SERVER['HTTP_ACCEPT_LANGUAGE']) AS $requestedLanguage) {
            $requestedLanguage = preg_replace('/;.*/', '', $requestedLanguage);
            $requestedLanguage = static::normalizeLocaleName($requestedLanguage);

            if (in_array($requestedLanguage, $availableLocales)) {
                return static::$_requestedLocale = $requestedLanguage;
            }
        }

        return static::$_requestedLocale = static::$default;
    }

    public static function normalizeLocaleName($locale)
    {
        $locale = strtr($locale, '-', '_');

        if (strpos($locale, '.') === false) {
            $locale .= '.utf8';
        }

        return $locale;
    }

    /**
     * Gets list of locales available on this site
     */
    public static function getAvailableLocales()
    {
        // get available languages for this site
        if (!$availableLocales = Cache::fetch('locales')) {
            Emergence_FS::cacheTree('locales');
            $availableLocales = array_keys(Emergence_FS::getAggregateChildren('locales'));
            sort($availableLocales);
            Cache::store('locales', $availableLocales, 300);
        }

        return $availableLocales;
    }

    public static function loadLocale($locale)
    {
        $localesPath = Site::$rootPath.'/site-data/locales';
        $localePath = "$localesPath/$locale";
        $messagesPath = "$localePath/LC_MESSAGES";
        $poPath = "$messagesPath/site.po";

        // get locale file info from virtual filesystem
        $node = Site::resolvePath("locales/$locale/site.po");

        if (!$node) {
            return false;
        }

        // write .po file to disk and compile to .mo if current version unknown or doesn't match
        if (Cache::fetch("locale/$locale") != $node->SHA1) {
            if (!is_dir($messagesPath)) {
                mkdir($messagesPath, 0777, true);
            }

            copy($node->RealPath, $poPath);

            // erase any old files
            foreach (glob("$messagesPath/site-*.mo") AS $oldFile) {
                unlink($oldFile);
            }

            // compile new .mo
            exec("msgfmt -o \"$messagesPath/site-$node->SHA1.mo\" -v \"$poPath\"");
            Cache::store("locale/$locale", $node->SHA1);
        }

        // configure gettext
        $domain = "site-$node->SHA1";
        putenv("LANG=$locale");
        setlocale(LC_ALL, $locale);
        bindtextdomain($domain, $localesPath);
        bind_textdomain_codeset($domain, 'UTF-8');
        textdomain($domain);

        return $locale;
    }

    public static function loadRequestedLocale()
    {
        return static::loadLocale(static::getRequestedLocale());
    }
}