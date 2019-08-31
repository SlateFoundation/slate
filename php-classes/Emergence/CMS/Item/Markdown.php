<?php

namespace Emergence\CMS\Item;

class Markdown extends AbstractItem
{
    public function renderBody()
    {
        return
            '<div class="content-item content-markdown" data-itemId="'.$this->ID.'">'
            .\Michelf\SmartyPantsTypographer::defaultTransform(
                    \Michelf\MarkdownExtra::defaultTransform($this->Data)
                )
            .'</div>';
    }
}