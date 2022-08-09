<?php

namespace Emergence\Site\Renderers;

use InvalidArgumentException;

use Emergence\Site\IRenderer;
use Emergence\Site\IResponse;

class StaticContent implements IRenderer
{
    public function render(IResponse $response)
    {
        $payload = $response->getPayload();

        if (!empty($payload['node'])) {
            return $payload['node']->outputAsResponse();
        }

        if (!empty($payload['body'])) {
            if (!empty($payload['contentType'])) {
                header('Content-Type: '.$payload['contentType']);
            }

            print($payload['body']);
            return true;
        }

        throw new InvalidArgumentException('expected node or body in payload');
    }
}
