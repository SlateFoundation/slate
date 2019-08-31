<?php

namespace Emergence\Site;


interface IResponse
{
    public function getId();
    public function setId($id);

    public function getPayload();
    public function setPayload(array $payload);
    public function setPayloadKey($key, $value);

    public function getRenderer();
    public function setRenderer(IRenderer $renderer);
}