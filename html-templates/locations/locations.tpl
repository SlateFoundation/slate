{extends "designs/site.tpl"}

{block "title"}Locations &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Locations Directory</h2>
    </header>

    <table class="auto-width row-stripes row-highlight">
        <thead>
            <tr>
                <th scope="col">Code</th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Parent Location</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        {foreach item=Location from=$data}
            <tr>
                <td><a href="{$Location->getURL()}">{$Location->Handle}</a></td>
                <td>{$Location->getTitle()|escape}</td>
                <td>{$Location->Status}</td>
                <td>
                    {if $Location->Parent}
                        {$Location->Parent->getTitle()}
                    {else}
                        &nbsp;
                    {/if}
                </td>
                <td><a class="button small" href="/sections?location={$Location->Handle}">Browse sections</a></td>
            </tr>
        {/foreach}
        </tbody>
    </table>
{/block}