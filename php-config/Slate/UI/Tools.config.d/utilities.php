<?php

if (empty($GLOBALS['Session']) || !$GLOBALS['Session']->hasAccountLevel('Administrator')) {
    return;
}

Slate\UI\Tools::$tools['Utilities']['Power Tools'] = [
  '_href' => '/powertools',
  '_icon' => 'gears'
];