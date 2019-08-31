<?php

namespace Jarvus\Sencha\Framework;

class Ext extends \Jarvus\Sencha\Framework
{
    public function getDownloadUrl()
    {
        return parent::getDownloadUrl() ?: preg_replace('/^(\\d+\\.\\d+\\.\\d+)(\\.\\d*)?$/', 'http://cdn.sencha.com/ext/gpl/ext-$1-gpl.zip', $this->version);
    }
}