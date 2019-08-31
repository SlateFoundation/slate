<?php

namespace Emergence\Site\Renderers;

use RequestHandler;
use Emergence\Site\IRenderer;
use Emergence\Site\IResponse;

class Auto implements IRenderer
{
    protected $mode;
    protected $templatePrefix;


    public function __construct($mode = 'html', $templatePrefix = null)
    {
        $this->mode = $mode;
        $this->templatePrefix = $templatePrefix;
    }


    public function getMode()
    {
        return $this->mode;
    }

    public function setMode($mode)
    {
        $this->mode = $mode;
    }

    public function getTemplatePrefix()
    {
        return $this->templatePrefix;
    }

    public function setTemplatePrefix($templatePrefix)
    {
        $this->templatePrefix = $templatePrefix;
    }


    public function render(IResponse $response)
    {
        $templateId = $response->getId();

        if ($this->templatePrefix) {
            $templateId = trim($this->templatePrefix, '/').'/'.$templateId;
        }

        return RequestHandler::respond($templateId, $response->getPayload(), $this->getMode());
    }
}