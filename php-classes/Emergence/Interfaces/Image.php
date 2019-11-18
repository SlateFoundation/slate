<?php

namespace Emergence\Interfaces;

interface Image
{
    public function getImage(array $options = []);
    public function getImageUrl($maxWidth = null, $maxHeight = null, array $options = []);
}
