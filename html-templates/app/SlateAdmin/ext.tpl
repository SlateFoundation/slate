{extends app/ext.tpl}

{block meta}
    {$title = "Manage Slate"}
    {$dwoo.parent}
{/block}

{block css-app}
    {cssmin fonts/lato.css+fonts/font-awesome.css}
    {$dwoo.parent}
{/block}

{block js-app}
    {$dwoo.parent}
    {include includes/site.analytics.tpl}
{/block}