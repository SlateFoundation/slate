<?php

/**
 * @deprecated
 * Compatibility layer for Emergence\Comments\CommentsRequestHandler
 */
class CommentsRequestHandler extends Emergence\Comments\CommentsRequestHandler
{
    public static function __classLoaded()
    {
        Emergence\Logger::general_warning('Deprecated class loaded: '.__CLASS__);
    }
}