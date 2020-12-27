{extends "designs/site.tpl"}

{block "title"}Terms &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Terms Directory</h2>
    </header>

    <table class="auto-width row-stripes row-highlight">
        <thead>
            <tr>
                <th scope="col">Code</th>
                <th scope="col">Title</th>
                <th scope="col">Start Date</th>
                <th scope="col">End Date</th>
                <th scope="col">Status</th>
                <th scope="col">Parent Term</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        {foreach item=Term from=$data}
            <tr>
                <td><a href="{$Term->getURL()}">{$Term->Handle}</a></td>
                <td>{$Term->getTitle()|escape}</td>
                <td>{$Term->StartDate|default:'&nbsp;'}</td>
                <td>{$Term->EndDate|default:'&nbsp;'}</td>
                <td>{$Term->Status}</td>
                <td>
                    {if $Term->Parent}
                        {$Term->Parent->getTitle()}
                    {else}
                        &nbsp;
                    {/if}
                </td>
                <td><a class="button small" href="/sections?term={$Term->Handle}">Browse sections</a></td>
            </tr>
        {/foreach}
        </tbody>
    </table>
{/block}