{extends app/ext.tpl}

{block meta}
    {$title = "Manage Slate"}
    {$dwoo.parent}
{/block}

{block css-app}
    {cssmin fonts/lato.css}
    {cssmin fonts/font-awesome.css}
    {$dwoo.parent}
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
        {*<script type="text/javascript" src="{$jsEntryPath}"></script>*}
    {/if}

    {block js-app-local}
        <script type="text/javascript" src="{$App->getVersionedPath($jsEntryPath)}"></script>
    {/block}

    {block js-app-remote}
        {foreach item=script from=$App->getAppCfg('js')}
            {if $script.remote}
                <script src="{$script.path|escape}"></script>
            {/if}
        {/foreach}
    {/block}
    {if $.User->hasAccountLevel(Developer) && $.get.slateHost}
        <script>
            Ext.onReady(function() {
                SlateAdmin.API.setHostname({$.get.slateHost|json_encode});
            });
        </script>
    {/if}
    {include includes/site.analytics.tpl}
{/block}