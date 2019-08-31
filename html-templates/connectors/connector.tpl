{extends designs/site.tpl}

{block title}{$title|escape} &mdash; Connectors &mdash; {$dwoo.parent}{/block}

{block content}
    <h1>{$title|escape}</h1>

    {if is_a($class, '\\Emergence\\Connectors\\ISynchronize', true)}
        <a href="{$connectorBaseUrl}/synchronize" class="button">Synchronize</a>
    {else}
        <p>This connector has no interface here yet</p>
    {/if}
{/block}