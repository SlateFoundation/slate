<?php

namespace Emergence\WebApps;


interface IApp
{
    public static function load($appName);
    /**
     * @return \Emergence\Site\IResponse
     */
    public function render();
    public function getName();
    public function getUrl();
    public function renderAsset($path);
}
