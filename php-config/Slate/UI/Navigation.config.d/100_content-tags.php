<?php

Slate\UI\Navigation::$links['About'] = Emergence\CMS\Page::getByHandle('about');
Slate\UI\Navigation::$links['Students'] = Tag::getByHandle('students');
Slate\UI\Navigation::$links['Parents'] = Tag::getByHandle('parents');
Slate\UI\Navigation::$links['Staff'] = Tag::getByHandle('staff');
Slate\UI\Navigation::$links['Community'] = Tag::getByHandle('community');