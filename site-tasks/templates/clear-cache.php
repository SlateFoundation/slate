<?php

return [
    'title' => 'Clear compiled templates cache',
    'description' => 'Erase the entire compiled templates cache, forcing all templates to be recompiled on their next use',
    'icon' => 'eraser',
    'handler' => function () {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $templatesDeleted = 0;
            $templatesDir = Emergence\Dwoo\Engine::getInstance()->getCompileDir().Site::getConfig('handle');

            foreach (glob("{$templatesDir}/*.php") as $templatePath) {
                $templatesDeleted += unlink($templatePath);
            }

            return static::respond('message', [
                'title' => 'Templates cleared',
                'message' => "Erased $templatesDeleted compiled templates"
            ]);
        }

        return static::respond('confirm', [
            'question' => 'Clear entire compiled templates cache?'
        ]);
    }
];