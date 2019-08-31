<?php

namespace Emergence\Site\Renderers;

use Exception;

use Site;
use SiteFile;
use Emergence\Dwoo\Engine;
use Emergence\Dwoo\Template;
use Emergence\Site\IRenderer;
use Emergence\Site\IResponse;

class DwooTemplate implements IRenderer
{
    protected $template;
    protected $contentType = 'text/html; charset=utf-8';


    public function __construct(Template $template, $contentType = null)
    {
        $this->template = $template;

        if ($contentType) {
            $this->contentType = $contentType;
        }
    }

    public static function fromTreeContext($path, $context = null, $contentType = null)
    {
        $node = Template::findNode($path, true, $context);
        return static::fromNode($node, $contentType);
    }

    public static function fromPath($path, $contentType = null)
    {
        if (!$node = Site::resolvePath($path)) {
            throw new Exception('no node found at template path: '.$path);
        }

        return static::fromNode($node, $contentType);
    }

    public static function fromNode(SiteFile $node, $contentType = null)
    {
        return new static(new Template($node), $contentType);
    }


    public function getTemplate()
    {
        return $this->mode;
    }

    public function setTemplate(Template $mode)
    {
        $this->mode = $mode;
    }

    public function getContentType()
    {
        return $this->contentType;
    }

    public function setContentType($contentType)
    {
        $this->contentType = $contentType;
    }


    public function render(IResponse $response)
    {
        header('Content-Type: '.$this->contentType);
        header('X-Response-ID: '.$response->getId());

        return Engine::respond($this->template, $response->getPayload());
    }
}