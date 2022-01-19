<?php

if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel('Staff')) {
    return;
}

Slate\UI\Tools::$tools['Utilities']['Power Tools'] = [
  '_href' => '/powertools',
  '_icon' => 'gears'
];