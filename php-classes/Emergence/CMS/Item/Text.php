<?php

namespace Emergence\CMS\Item;

class Text extends AbstractItem
{
    public function renderBody()
    {
        return '<div class="content-item content-text" id="contentItem-'.$this->ID.'">'.nl2br(htmlspecialchars($this->Data)).'</div>';
        // return '<div class="content-item content-text" id="contentItem-'.$this->ID.'">'.MarkdownExtra::defaultTransform($this->Data).'</div>';
    }
}