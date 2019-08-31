<?php

namespace Emergence\CMS\Item;

class Album extends AbstractItem
{
    public function renderBody()
    {
        return
            '<link rel="stylesheet" href="/css/slideshow.css">'
            .'<div class="content-item content-album" id="contentItem-'.$this->ID.'">'
                .'<div class="loading"><img src="/img/ux/spinner.gif" alt="">&nbsp;Loading slideshow&hellip;</div>'
            .'</div>'
            .'<script>'
                .'Ext.require("Jarvus.Media.Slideshow", function() {'
                    .'Ext.create("Jarvus.Media.Slideshow", {'
                        .'renderTo: Ext.get("contentItem-'.$this->ID.'")'
                        .',title: '.json_encode($this->Data ? $this->Data['Title'] : null)
                        .',credit: '.json_encode($this->Data ? $this->Data['Credit'] : null)
                        .',items: '.json_encode($this->Data ? $this->Data['items'] : null)
                    .'});'
                .'});'
            .'</script>';
    }
}