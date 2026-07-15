<?php

$finder = (new PhpCsFixer\Finder())
    ->in([
        __DIR__.'/php-classes',
    ]);

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
    ])
    ->setRiskyAllowed(false)
    ->setFinder($finder);
