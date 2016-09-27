{extends "designs/site.tpl"}

{block "title"}Password saved &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h1 class="header-title title-1">New Password Saved</h1>
    </header>

    <p class="page-info">Your new password has been saved, remember to use it next time you login.</p>

    <p>
    {if $returnUrl}
        <a class="button submit" href="{$returnUrl|escape}">Finish logging in</a>
    {else}
        <a class="button submit" href="/dashboard">Continue to your dashboard</a>
    {/if}
    </p>
{/block}