<?php

namespace Emergence\CMS\Item;

class RichText extends AbstractItem
{
    public function renderBody()
    {
        return '<div class="content-item content-richtext" id="contentItem-'.$this->ID.'">'.$this->Data.'</div>';
    }
}