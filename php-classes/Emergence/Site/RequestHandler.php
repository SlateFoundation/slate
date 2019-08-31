<?php

namespace Emergence\Site;


abstract class RequestHandler extends \RequestHandler implements IRequestHandler
{
    public static function sendResponse(IResponse $response, IRenderer $renderer = null)
    {
        $renderer = $renderer ?: $response->getRenderer() ?: new Renderers\Auto();

        return $renderer->render($response);
    }
}