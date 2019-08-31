<?php

namespace Emergence\Site;


class Response implements IResponse
{
    protected $id;
    protected $payload;
    protected $renderer;


    public function __construct($id, array $payload = [], IRenderer $renderer = null)
    {
        $this->id = $id;
        $this->payload = $payload;
        $this->renderer = $renderer;
    }


    public function getId()
    {
        return $this->id;
    }

    public function setId($id)
    {
        $this->id = $id;
    }

    public function getPayload()
    {
        return $this->payload;
    }

    public function setPayload(array $payload)
    {
        $this->payload = $payload;
    }

    public function setPayloadKey($key, $value)
    {
        $this->payload[$key] = $value;
    }

    public function getRenderer()
    {
        return $this->renderer;
    }

    public function setRenderer(IRenderer $renderer)
    {
        $this->renderer = $renderer;
    }
}