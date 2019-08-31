{extends "designs/site.tpl"}

{block title}Tags &mdash; {$dwoo.parent}{/block}

{block content}
    <header class="page-header">
        <h2 class="header-title">All tags</h2>
    </header>

    <section class="page-section">
        <ul>
        {foreach item=Tag from=$data}
            <li>{contextLink $Tag}</li>
        {/foreach}
        </ul>
    </section>

{/block}