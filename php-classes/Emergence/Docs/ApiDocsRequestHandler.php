<?php

namespace Emergence\Docs;

use Site;
use Emergence\OpenAPI\Reader AS OpenAPIReader;
use Emergence\OpenAPI\Writer AS OpenAPIWriter;


class ApiDocsRequestHandler extends \RequestHandler
{
    public static $userResponseModes = [
        'application/json' => 'json',
        'application/x-yaml' => 'yaml'
    ];

    public static function handleRequest()
    {
        $hostname = Site::getConfig('primary_hostname');

        $servers = [
            [ 'url' => "http://{$hostname}/" ]
        ];

        if (Site::getConfig('ssl')) {
            array_unshift($servers, [ 'url' => "https://{$hostname}/" ]);
        }

        $openApiData = OpenAPIReader::readTree([ 'servers' => $servers ]);

        $openApiData = OpenAPIWriter::sort($openApiData);

        return static::respond('openAPI', $openApiData);
    }
}