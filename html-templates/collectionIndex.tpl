{extends designs/site.tpl}

{block title}{$path|escape} &mdash; {$dwoo.parent}{/block}

{block content}
    <h1>Index of {$path|escape}</h1>

    <ul>
        {foreach item=node key=name from=$nodes}
            {if $name != '_index.php'}
                {$subPath = $name|basename:'.php'}
                <li><a href="{$path|escape}/{$subPath|escape}">{$subPath|escape}</a></li>
            {/if}
        {/foreach}
    </ul>
{/block}