<?php

Slate\UI\Navigation::$links['Students'] = [
    '_tag' => Tag::getByHandle('students'),
    '_weight' => -1300
];

Slate\UI\Navigation::$links['Parents'] = [
    '_tag' => Tag::getByHandle('parents'),
    '_weight' => -1200
];

Slate\UI\Navigation::$links['Staff'] = [
    '_tag' => Tag::getByHandle('staff'),
    '_weight' => -1100
];

Slate\UI\Navigation::$links['Community'] = [
    '_tag' => Tag::getByHandle('community'),
    '_weight' => -1000
];