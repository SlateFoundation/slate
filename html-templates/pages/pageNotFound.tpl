{extends "designs/site.tpl"}

{block title}{_ "Page not found &mdash;"} {$dwoo.parent}{/block}

{block content}

    <h1>Page not found</h1>
    {if $.Session->hasAccountLevel('Staff')}
        <p>This page doesn't exist yet.</p>
        <form action="/pages/create" method="GET">
            <input type="text" name="Title" value="{$pageHandle|replace:'_':' '|ucwords|escape}">
            <input type="submit" value="{_ 'Create Page &raquo;'}">
        </form>
    {else}
        <p>{_ "This page you requested doesn't exist."}</p>
    {/if}

{/block}
