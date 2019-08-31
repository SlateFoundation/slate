<?php

namespace Jarvus\Sencha\Framework;

class Touch extends \Jarvus\Sencha\Framework
{
    public function getDownloadUrl()
    {
        return parent::getDownloadUrl() ?: preg_replace('/^(\\d+\\.\\d+\\.\\d+)(\\.\\d*)?$/', 'http://cdn.sencha.com/touch/gpl/sencha-touch-$1-gpl.zip', $this->version);
    }
}