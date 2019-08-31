<?php

namespace Emergence\ActiveRecord\Fields;

class String extends AbstractField
{
    public static function getAliases()
    {
        return ['string', 'varchar'];
    }

    public static function initOptions(array &$options)
    {
        if (isset($options['blankisnull'])) {
            if (!isset($options['blankIsNull'])) {
                $options['blankIsNull'] = $options['blankisnull'];
            }

            unset($options['blankisnull']);
        }

        if (!isset($options['blankIsNull'])) {
            $options['blankIsNull'] = !empty($options['null']);
        }

        return $options;
    }
}
