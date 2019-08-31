{extends "designs/site.tpl"}

{block title}Page not found &mdash; {$dwoo.parent}{/block}

{block content}

    <h1>Page not found</h1>
    {if $.Session->hasAccountLevel('Staff')}
        <p>This page doesn't exist yet.</p>
        <form action="/pages/create" method="GET">
            <input type="text" name="Title" value="{$pageHandle|replace:'_':' '|ucwords|escape}">
            <input type="submit" value="Create Page &raquo;">
        </form>
    {else}
        <p>This page you requested doesn't exist.</p>
    {/if}

{/block}