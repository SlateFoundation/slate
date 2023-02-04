{extends "webapps/vue.tpl"}

{block css-head}
    {$dwoo.parent}

    {include "includes/site.css.tpl"}
{/block}

{block body}
    {include "includes/site.user-tools.tpl" fluid=true}
{/block}