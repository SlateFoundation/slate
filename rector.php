<?php

declare(strict_types=1);

use Rector\CodeQuality\Rector\Class_\ConvertStaticToSelfRector;
use Rector\Config\RectorConfig;
use Rector\Php71\Rector\FuncCall\RemoveExtraParametersRector;
use Rector\Php80\Rector\Switch_\ChangeSwitchToMatchRector;
use Rector\Php80\Rector\Class_\StringableForToStringRector;
use Rector\Php83\Rector\ClassMethod\AddOverrideAttributeToOverriddenMethodsRector;
use Rector\TypeDeclaration\Rector\FuncCall\AddArrowFunctionParamArrayWhereDimFetchRector;
use Rector\TypeDeclaration\Rector\FunctionLike\AddClosureParamTypeForArrayMapRector;
use Rector\TypeDeclaration\Rector\Closure\ClosureReturnTypeRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__.'/php-classes',
    ])
    // framework layers Slate is hologit-composed against (skeleton-v3 +
    // emergence/php-core via its vendor tree, layer-events, saml2, dwoo);
    // run script/fetch-analysis-context to populate. Symbols only -- never
    // rewritten or reported on.
    ->withAutoloadPaths([
        __DIR__.'/.analysis-context/skeleton-v3/php-classes',
        __DIR__.'/.analysis-context/skeleton-v3/vendor/emergence/php-core/src',
        __DIR__.'/.analysis-context/skeleton-v3/vendor/emergence/php-core/src-compat',
        __DIR__.'/.analysis-context/layer-events/php-classes',
        __DIR__.'/.analysis-context/emergence-saml2/php-classes',
        __DIR__.'/.analysis-context/dwoo/lib',
    ])
    ->withPhpSets(php83: true)
    // typeDeclarations is deliberately OFF, unlike the php-core gate this
    // mirrors: method signature types (return types especially) fatal any
    // downstream subclass that overrides the method without them, and unlike
    // php-core -- whose consumers are enumerable -- Slate is subclassed by
    // layers that cannot all be audited (slate-cbl/slate-sbg/slate-spark,
    // school skeletons, private school-site layers). The very methods the
    // set wants to type (save, destroy, getTitle, __classLoaded...) are
    // demonstrably overridden downstream without types. Closure-scoped type
    // rules are cherry-picked below instead; closures cannot be overridden.
    ->withPreparedSets(
        deadCode: true,
        codeQuality: true,
        privatization: true,
        earlyReturn: true,
    )
    ->withRules([
        ClosureReturnTypeRector::class,
        AddClosureParamTypeForArrayMapRector::class,
        AddArrowFunctionParamArrayWhereDimFetchRector::class,
    ])
    ->withSkip([
        // Late static binding (static::) is the primary extension mechanism
        // of the Emergence class model - school-site layers and product
        // sublayers (slate-cbl, slate-sbg, scienceleadership-skeleton...)
        // override Slate's statics constantly; never rewrite to self::.
        ConvertStaticToSelfRector::class,

        // #[Override] hard-couples Slate's methods to the exact parent
        // chain present at analysis time, but hologit composition lets
        // deeper layers swap parent-class files per site - a cosmetic
        // attribute must not be able to turn into a class-load fatal.
        AddOverrideAttributeToOverriddenMethodsRector::class,

        // match compares strictly; these legacy switches loose-compare
        // request params and DB values by design.
        ChangeSwitchToMatchRector::class,

        // The "extra" arguments this would delete (e.g. in
        // AbstractSpreadsheetConnector) look like missing parameters in the
        // callee signatures, i.e. real bugs to fix deliberately - deleting
        // the arguments would silently codify the data loss.
        RemoveExtraParametersRector::class,

        // adds `implements Stringable` plus an explicit `: string` on
        // __toString - a method-signature type, held per the note on
        // typeDeclarations above (downstream layers override __toString
        // without it).
        StringableForToStringRector::class,
    ]);
