<?php

namespace Emergence\DAV;

class ServerPlugin extends \Sabre\DAV\ServerPlugin
{
    /**
     * reference to server class.
     *
     * @var Sabre\DAV\Server
     */
    protected $server;

    public function initialize(\Sabre\DAV\Server $server)
    {
        $this->server = $server;

        $server->subscribeEvent('beforeMethod', [$this, 'httpGetInterceptor']);
        $server->subscribeEvent('beforeMethod', [$this, 'beforeMethod']);
        $server->subscribeEvent('beforeCreateFile', [$this, 'beforeCreateFile']);
    }

    public function httpGetInterceptor($method, $uri)
    {
        if ('GET' !== $method || 'json' != DevelopRequestHandler::getResponseMode()) {
            return true;
        }

        $pathParts = \Site::splitPath($uri);
        $rootPath = RootCollection::filterName($pathParts[0]);

        if (count($pathParts) && array_key_exists($rootPath, RootCollection::$siteDirectories)) {
            $className = RootCollection::$siteDirectories[$rootPath];
            $node = new $className($pathParts[0]);

            if (count($pathParts) > 1) {
                $node = $node->resolvePath(array_splice($pathParts, 1));
            }
        } else {
            $node = \Site::resolvePath($uri, false);
        }

        if (!$node) {
            throw new \Sabre\DAV\Exception\FileNotFound();
        }

        $children = [];
        foreach ($node->getChildren() as $child) {
            $children[] = $child->getData();
        }

        $this->server->httpResponse->sendStatus(200);
        $this->server->httpResponse->setHeader('Content-Type', 'application/json');

        $this->server->httpResponse->sendBody(json_encode([
            'path' => $uri, 'children' => $children,
        ]));

        return false;
    }

    /**
     * This method is called before the logic for any HTTP method is
     * handled.
     *
     * This plugin uses that feature to intercept access to locked resources.
     *
     * @param string $method
     * @param string $uri
     *
     * @return bool
     */
    public function beforeMethod($method, $uri)
    {
        switch ($method) {
            case 'GET':
                if (!$node) {
                    $node = $this->server->tree->getNodeForPath($uri);
                }

                $this->server->httpResponse->setHeader('X-Revision-ID', $node->ID);

                break;
            case 'PUT':
                if (0 === stripos($uri, '_parent/')) {
                    $this->server->httpResponse->setHeader('Location', 'http://'.$_SERVER['HTTP_HOST'].'/develop/'.str_replace('_parent/', null, $uri));
                }

                break;
        }

        return true;
    }

    public function beforeCreateFile($uri, $data)
    {
        list($dir, $name) = \Sabre\DAV\URLUtil::splitPath($uri);

        $currentNode = null;
        foreach (explode('/', trim($dir, '/')) as $pathPart) {
            $parentNode = $currentNode;
            $currentNode = \SiteCollection::getByHandle($pathPart, $parentNode ? $parentNode->ID : null);

            if (!$currentNode) {
                $currentNode = \SiteCollection::create($pathPart, $parentNode);
            }
        }
    }
}
