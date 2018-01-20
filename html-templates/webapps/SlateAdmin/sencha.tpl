{extends "webapps/slate-sencha.tpl"}

{block meta}
    {$title = "Manage Slate"}
    {$dwoo.parent}
{/block}

{block css-app}
    {cssmin "fonts/font-awesome.css"}

    {$dwoo.parent}
{/block}

{block js-app}
    {$dwoo.parent}

    {foreach item=package from=SlateAdmin::getPlugins()}
        <script type="text/javascript" src="{$App->getVersionedPath(cat('packages/', $package, '/build/', $package, '.js'))}"></script>
    {/foreach}
{/block}