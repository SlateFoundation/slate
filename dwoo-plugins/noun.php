<?php

function Dwoo_Plugin_noun(Dwoo_Core $dwoo, $object, $mode = 'singular')
{
    if (!is_a($object, 'ActiveRecord')) {
        die('Unable to apply noun() to non-ActiveRecord');
    }

    switch ($mode) {
        case 'singular': return $object::$singularNoun;
        case 'plural': return $object::$pluralNoun;
        default: die('noun(): unknown mode');
    }
}



?>