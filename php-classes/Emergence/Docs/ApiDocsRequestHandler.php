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
        $schemes = ['http'];

        if (Site::getConfig('ssl')) {
            array_unshift($schemes, 'https');
        }

        $openApiData = OpenAPIReader::readTree([
            'host' => Site::getConfig('primary_hostname'),
            'schemes' => $schemes
        ]);

        $openApiData = OpenAPIWriter::sort($openApiData);

        return static::respond('openAPI', $openApiData);
    }
}