<?php

namespace Emergence\Site;


interface IRenderer
{
    public function render(IResponse $response);
}