<?php

namespace Jarvus\Sencha;

interface IPackage
{
    public static function load($name, Framework $framework);

    public function getName();
    public function getConfig($key = null);
    public function getFileContents($path);
    public function getFilePointer($path);
    public function writeToDisk($path);
    public function getVirtualPath($autoLoad = true);
}