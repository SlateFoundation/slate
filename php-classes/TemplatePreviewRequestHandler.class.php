<?php

class TemplatePreviewRequestHandler
{
    public static $requiredAccountLevel = 'Developer';

    public static function handleRequest()
    {
        if (static::$requiredAccountLevel) {
            $GLOBALS['Session']->requireAccountLevel(static::$requiredAccountLevel);
        }

        Emergence\Dwoo\Engine::respond(implode('/', Site::$pathStack));
    }
}