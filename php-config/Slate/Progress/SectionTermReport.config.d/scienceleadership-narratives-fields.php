<?php

namespace Slate\Progress;

SectionTermReport::$fields['Assessment'] = [
    'type' => 'clob',
    'default' => null
];

SectionTermReport::$fields['Grade'] = [
    'type' => 'enum',
    'values' => ['A', 'B', 'C', 'D', 'F', 'inc'],
    'default' => null
];