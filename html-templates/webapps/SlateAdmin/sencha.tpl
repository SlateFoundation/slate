{extends "webapps/slate-sencha.tpl"}

{block meta}
    {$title = "Manage Slate"}

    {$dwoo.parent}
{/block}

{block css-app}
    {cssmin "fonts/font-awesome.css"}

    {$dwoo.parent}
{/block}