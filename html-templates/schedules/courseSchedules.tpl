{extends "designs/site.tpl"}

{block "title"}Schedules &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Schedules Directory</h2>
    </header>

    <table class="auto-width row-stripes row-highlight">
        <thead>
            <tr>
                <th scope="col">Code</th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        {foreach item=Schedule from=$data}
            <tr>
                <td><a href="{$Schedule->getURL()}">{$Schedule->Handle}</a></td>
                <td>{$Schedule->getTitle()|escape}</td>
                <td>{$Schedule->Status}</td>
                <td><a class="button small" href="/sections?schedule={$Schedule->Handle}">Browse sections</a></td>
            </tr>
        {/foreach}
        </tbody>
    </table>
{/block}