{extends "design.tpl"}

{block nav}
    {$activeSection = dashboard}
    {$dwoo.parent}
{/block}

{block content}
    <header class="row">
        <h1>Site Dashboard</h1>
    </header>

    <dl class="row">
        {foreach item=metric from=$metrics}
            <dt class="col-3 text-right">{$metric.label|escape}</dt>
            <dd class="col-9">
                {if $metric.link}
                    <a href="{$metric.link|escape}">
                {/if}

                {if is_int($metric.value)}
                    {$metric.value|number_format}
                {else}
                    {$metric.value|escape}
                {/if}

                {if $metric.link}
                    </a>
                {/if}
            </dd>
        {/foreach}
    </dl>

    <header class="row">
        <h2>Exports</h2>
    </header>

    <dl class="row">
        <dt class="col-3 text-right">Database</dt>
        <dd class="col-9">
            <a href="/site-admin/database/dump.sql?_session={$.Session->Handle}" class="btn btn-sm btn-outline-info">Download .sql dump</a>
        </dd>
    </dl>
{/block}