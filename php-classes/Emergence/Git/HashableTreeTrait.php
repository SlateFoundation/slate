<?php

namespace Emergence\Git;

trait HashableTreeTrait
{
    public function getPaths($options = [])
    {
        return TreeUtil::getPaths($this->getRepository(), $this->getHash(), $options);
    }

    public function getPathHash($path = '')
    {
        return TreeUtil::getHash($this->getRepository(), $this->getHash(), $path);
    }

    public function getPathContent($path = '')
    {
        return TreeUtil::getContent($this->getRepository(), $this->getHash(), $path);
    }

    public function getPathStream($path = '')
    {
        return TreeUtil::getStream($this->getRepository(), $this->getHash(), $path);
    }

    public function writePathToDisk($outputPath, $path = '')
    {
        return TreeUtil::writeToDisk($this->getRepository(), $this->getHash(), $outputPath, $path);
    }

    abstract protected function getRepository();

    abstract protected function getHash();
}
