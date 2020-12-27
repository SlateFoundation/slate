{extends "designs/site.tpl"}

{block "title"}Departments &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Departments Directory</h2>
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
        {foreach item=Department from=$data}
            <tr>
                <td><a href="{$Department->getURL()}">{$Department->Handle}</a></td>
                <td>{$Department->getTitle()|escape}</td>
                <td>{$Department->Status}</td>
                <td><a class="button small" href="/sections?department={$Department->Handle}">Browse sections</a></td>
            </tr>
        {/foreach}
        </tbody>
    </table>
{/block}