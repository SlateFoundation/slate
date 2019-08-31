<?php

class HandleBehavior extends RecordBehavior
{
    public static $alwaysSuffix = false;
    public static $suffixFormat = '%s-%u';
    public static $transliterate = true;

    public static function onSave(ActiveRecord $Record, $handleInput = false, array $handleOptions = array())
    {
        // set handle
        if (!$Record->Handle) {
            $Record->Handle = static::getUniqueHandle($Record, $handleInput ? $handleInput : $Record->Title, $handleOptions);
        }
    }

    public static function onValidate(ActiveRecord $Record, RecordValidator $validator)
    {
        $validator->validate(array(
            'field' => 'Handle'
            ,'required' => false
            ,'validator' => 'handle'
            ,'errorMessage' => 'Handle can only contain letters, numbers, hyphens, and underscores'
        ));

        // check handle uniqueness
        if ($Record->isFieldDirty('Handle') && !$validator->hasErrors('Handle') && $Record->Handle) {
            $ExistingRecord = $Record::getByHandle($Record->Handle);

            if ($ExistingRecord && ($ExistingRecord->ID != $Record->ID)) {
                $validator->addError('Handle', 'Handle already registered');
            }
        }
    }

    public static function transformText($text, $options = array())
    {
        // apply default options
        $options = array_merge(array(
            'transliterate' => static::$transliterate
            ,'case' => 'lower' // 'lower' / 'upper' / null
        ), $options);

        // strip bad characters
        $text = preg_replace(
             array(
                 '/\s+/'                                // 1- Find spaces
                 ,'/^[^\\pL]+/u'                        // 2- Find anything not a letter at the beginning
                 ,'/[-_]*[^\\pL\d_:\-\.]+[-_]*/u'       // 3- Find non-allowed charecters segment and any placeholders next to it
                 ,'/[-_]*:[-_]*/')                      // 4- Find any : and any placeholders next to it
            ,array(
                '_'                                     // 1- Replace spaces with _
                , ''                                    // 2- Erase anything not a letter at the beginning
                ,'-'                                    // 3- Replace non-allowed characters with -
                ,'--'                                   // 4- Replace any : with --
            )
            ,$text
        );

        // transliterate
        if ($options['transliterate']) {
            $text = Patchwork\Utf8::toAscii($text);

            // trim any non-word characters created during transliterate and any adjacent placeholders
            $text = preg_replace('/[-_]*[^-\w\.]+[-_]*/u', '', $text);
        }

        // transform case
        if ($options['case'] == 'lower') {
            $text = mb_strtolower($text, 'utf-8');
        } elseif ($options['case'] == 'upper') {
            $text = mb_strtoupper($text, 'utf-8');
        }

        // clean up any placeholder characters from ends
        $text = trim($text, '-_');

        return $text;
    }

    public static function getUniqueHandle($class, $text, $options = array())
    {
        // apply default options
        $options = array_merge(array(
            'handleField' => 'Handle'
            ,'domainConstraints' => array()
            ,'alwaysSuffix' => static::$alwaysSuffix
            ,'randomSuffix' => false
            ,'randomSuffixMin' => 100
            ,'randomSuffixMax' => 999
            ,'suffixFormat' => static::$suffixFormat
        ), $options);

        // transform text to handle-friendly form
        $text = static::transformText($text, $options);

        // restart with singular noun if nothing is left
        if (!$text) {
            return static::getUniqueHandle($class, $class::$singularNoun, $options);
        }

        // search for unique handle
        $where = $options['domainConstraints'];
        $incarnation = 0;
        $handle = $text;
        $recordExists = false;
        do {
            $incarnation++;

            if ($options['alwaysSuffix'] || $incarnation > 1) {
                $handle = sprintf($options['suffixFormat'], $text, $options['randomSuffix'] ? mt_rand($options['randomSuffixMin'], $options['randomSuffixMax']) : $incarnation);
            }

            $where[$options['handleField']] = $handle;
            try {
                $recordExists = $class::getByWhere($where);
            } catch (UserUnauthorizedException $e) {
                $recordExists = true;
            }
        } while ($recordExists);

        return $handle;
    }

    public static function generateRandomHandle($class, $length = 32, $options = array())
    {
        // apply default options
        $options = array_merge(array(
            'handleField' => 'Handle'
        ), $options);

        do {
            $handle = md5(mt_rand(0, mt_getrandmax()));

            // ensure first character is a letter
            if (ctype_digit($handle[0])) {
                if (preg_match('/\\pL/', $handle, $letterMatches, PREG_OFFSET_CAPTURE)) {
                    $handle = substr($handle, $letterMatches[0][1]).substr($handle, 0, $letterMatches[0][1]);
                } else {
                    $handle = '';
                }
            }

            // trim to desired length
            $handle = substr($handle, 0, $length);
        } while (!$handle || $class::getByField($options['handleField'], $handle));

        return $handle;
    }
}