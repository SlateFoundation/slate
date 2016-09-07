{extends app/slate-ext.tpl}

{block meta}
    {$title = "Manage Slate"}
    {$dwoo.parent}
{/block}

{block css-app}
    {cssmin fonts/font-awesome.css}
    {$dwoo.parent}
{/block}