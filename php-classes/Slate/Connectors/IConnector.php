<?php

namespace Slate\Connectors;

interface IConnector
{
    public static function getTitle();
    public static function getConnectorId();
    public static function handleRequest();
}