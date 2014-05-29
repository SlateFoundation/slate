{extends "designs/site.tpl"}


{block "content"}
    <header class="page-header">
        <h2 class="header-title">Course Section Directory</h2>
    </header>

    <ul>
    {foreach item=Section from=$data}
        <li><a href="/sections/{$Section->Handle}">{$Section->Title|escape}</a></li>
    {/foreach}
    </ul>
{/block}