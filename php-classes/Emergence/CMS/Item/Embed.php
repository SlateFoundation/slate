<?php

namespace Emergence\CMS\Item;

class Embed extends AbstractItem
{
    public function renderBody()
    {
        return '<div class="content-item content-embed" id="contentItem-'.$this->ID.'">'.$this->Data.'</div>';
    }
}