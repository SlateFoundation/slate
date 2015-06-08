<!DOCTYPE html>
{$appName = $App->getName()}
{$appTheme = default($.get.theme, $App->getBuildCfg('app.theme'))}
{$jsBuildPath = tif($App->getAsset("build/$mode/app.js"), "build/$mode/app.js", "build/$mode/all-classes.js")}
{$cssMode = tif($mode == 'development' ? 'production' : $mode)}
{$cssBuildPath = tif($appTheme, "build/$cssMode/resources/$appName-all.css", "build/$cssMode/resources/default/app.css")}
<html>
    <head>
        {block meta}
            <meta charset="UTF-8">
            <title>{if $title}{$title}{else}{$appName}-{$mode}{/if}</title>
        {/block}

        {block base}{/block}

        {block css-loader}{/block}
    </head>

    <body class="{block body-class}loading{/block}">
        {block body}
        {/block}

        {block js-data}
            <script type="text/javascript">
                var SiteEnvironment = SiteEnvironment || { };
                SiteEnvironment.user = {JSON::translateObjects($.User)|json_encode};
                SiteEnvironment.appName = {$App->getName()|json_encode};
                SiteEnvironment.appMode = {$mode|json_encode};
                SiteEnvironment.appBaseUrl = '/app/{$App->getName()}/{tif $mode == production || $mode == testing ? "build/$mode/"}';
            </script>
        {/block}

        {block css-app}
            {if $App->getAsset($cssBuildPath)}
                <link rel="stylesheet" type="text/css" href="{$App->getVersionedPath($cssBuildPath)}" />
            {elseif $appTheme}
                <link rel="stylesheet" type="text/css" href="{$App->getVersionedPath(cat('sdk/packages/$appTheme/build/resources/' $appTheme '-all.css'))}" />
                <script type="text/javascript" src="{$App->getVersionedPath(cat('sdk/packages/$appTheme/build/' $appTheme '.js'))}"></script>
            {else}
                <link rel="stylesheet" type="text/css" href="{$App->getVersionedPath('sdk/resources/css/ext-all.css')}" />
            {/if}
        {/block}

        {block js-app}
            {if $mode != 'development' && $App->getAsset($jsBuildPath)}
                {$jsEntryPath = $jsBuildPath}
            {else}
                {block js-app-devenv}
                    {$frameworkBuild = 'ext'}

                    {if $.get.frameworkBuild != core}
                        {$frameworkBuild .= '-all'}
                    {/if}

                    {if $mode == 'development' && $.get.frameworkBuild != allmin}
                        {$frameworkBuild .= tif($App->getAsset("sdk/$frameworkBuild-dev.js") ? '-dev' : '-debug')}
                    {/if}

                    {$frameworkPath = cat('sdk/build/' $frameworkBuild '.js')}
                    {if !$App->getAsset($frameworkPath)}
                        {$frameworkPath = cat('sdk/' $frameworkBuild '.js')}
                    {/if}

                    <script type="text/javascript" src="{$App->getVersionedPath($frameworkPath)}"></script>

                    {sencha_bootstrap}
                {/block}

                {$jsEntryPath = tif($App->getAsset('app.js') ? 'app.js' : 'app/app.js')}
                <script type="text/javascript" src="{$jsEntryPath}"></script>
            {/if}
            {if $mode != "development"}
                {block js-app-local}
                    <script type="text/javascript" src="{$App->getVersionedPath($jsEntryPath)}"></script>
                {/block}
            {/if}
            {block js-app-remote}
                {foreach item=script from=$App->getAppCfg('js')}
                    {if $script.remote}
                        <script src="{$script.path|escape}"></script>
                    {/if}
                {/foreach}
            {/block}
        {/block}
    </body>
    
</html>