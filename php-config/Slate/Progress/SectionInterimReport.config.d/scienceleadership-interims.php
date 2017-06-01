<?php

namespace Slate\Progress;

SectionInterimReport::$fields['Grade'] = [
    'type' => 'enum',
    'values' => ['A', 'B', 'C', 'D', 'F', 'N/A'],
    'default' => null
];