{extends "designs/site.tpl"}

{block content}
<div class="reading-width">
    <header class="page-header">
        <h2 class="header-title">My Drafts</h2>
        <div class="header-buttons"><a href="/blog/create?Status=Draft" class="button primary">New Draft</a></div>
    </header>

    <ul>
    {foreach item=Draft from=$data}
        <li>{contextLink $Draft}</li>
    {foreachelse}
        <li class="empty-text">You have no drafts saved. <a href="/blog/create?Status=Draft">Create a new draft.</a></li>
    {/foreach}
    </ul>
</div>
{/block}