<?php

return [
    'title' => 'Generate .pot file',
    'description' => 'Generate a `.pot` ("Portable Object Template") file with `xgettext` as a starting point for translations by scanning all PHP and Dwoo source files',
    'icon' => 'list-alt',
    'requireAccountLevel' => 'Administrator',
    'handler' => function () {

        // utility methods
        $extractStrings = function ($pattern, $contents, $fileVirtualPath, &$strings) {
            preg_match_all($pattern, $contents, $matches, PREG_OFFSET_CAPTURE);

            foreach ($matches[3] AS list($string, $offset)) {
                $strings[stripslashes($string)][] = $fileVirtualPath.':'.(substr_count(substr($contents, 0, $offset), "\n") + 1);
            }
        };

        $encodeString = function ($string) {
            return '"'.str_replace(PHP_EOL, '\n', addcslashes($string, '"\\')).'"';
        };

        // patterns for matching translatable strings
        $patternTemplate = '/(_|gettext)\(\s*(\'|")(.*?)\2\s*\)/si';
        $patternTemplateShort = '/\{(_|gettext)\s+("|\'|)(.*?)\2\s*\}/si';
        $patternPHP = '/(_|gettext)\s*\(\s*(\'|")(.*?)\2\s*\)/si';
        $patternPHPValidators = '/(\'|")errorMessage\1\s*=>\s*(\'|")(.*?)\2/s';

        // create a memory handle to write pot file to
        $pot = fopen('php://memory', 'w+');
        $strings = [];

        // extract strings from templates
        $files = Emergence_FS::getTreeFiles('html-templates', false, ['Type' => 'text/x-html-template']);

        foreach ($files AS $path => $fileData) {
            $contents = file_get_contents(SiteFile::getByID($fileData['ID'])->RealPath);
            $extractStrings($patternTemplate, $contents, $path, $strings);
            $extractStrings($patternTemplateShort, $contents, $path, $strings);
        }

        // extract strings from PHP files
        $files = Emergence_FS::getTreeFiles(null, false, ['Type' => 'application/php']);

        foreach ($files AS $path => $fileData) {
            $contents = file_get_contents(SiteFile::getByID($fileData['ID'])->RealPath);
            $extractStrings($patternPHP, $contents, $path, $strings);
            $extractStrings($patternPHPValidators, $contents, $path, $strings);
        }

        // write pot file
        foreach ($strings AS $string => $sources) {
            fwrite($pot, '#: '.implode(' ', $sources).PHP_EOL);

            // switch output format if embedded newlines found (see https://www.gnu.org/software/gettext/manual/html_node/Normalizing.html)
            if (preg_match('/[^\n]\n+[^\n]/', $string)) {
                // multiline output format
                fwrite($pot, 'msgid ""'.PHP_EOL);
                fwrite($pot, str_replace('\n', '\n"'.PHP_EOL.'"', $encodeString($string)).PHP_EOL);
            } else {
                fwrite($pot, 'msgid '.$encodeString($string).PHP_EOL);
            }

            fwrite($pot, 'msgstr ""'.PHP_EOL.PHP_EOL);
        }

        rewind($pot);

        header('Content-Type: text/plain; charset=utf-8');
        header('Content-Disposition: attachment; filename="'.Site::getConfig('handle').'.pot"');
        fpassthru($pot);
    }
];