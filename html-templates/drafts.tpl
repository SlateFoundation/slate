{extends "designs/site.tpl"}

{block content}
    <header>
        <div class="mini-page-tools"><a href="/blog/create?Status=Draft" class="button primary">New Draft</a></div>
        <h1>My Drafts</h1>
    </header>

    <ul>
    {foreach item=Draft from=$data}
        <li>{contextLink $Draft}</li>
    {foreachelse}
        <li><em>You do not have any drafts</em></li>
    {/foreach}
    </ul>

{/block}