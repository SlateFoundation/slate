{extends "designs/site.tpl"}

{block title}Dashboard &mdash; {$dwoo.parent}{/block}

{block "js-bottom"}
    {$dwoo.parent}

    {if !$.get.jsdebug}
        <script src="{Site::getVersionedRootUrl('js/pages/Dashboard.js')}"></script>
    {/if}

    <script>
        Ext.require('Site.page.Dashboard');
    </script>
{/block}

{block "content"}
    {template dashboardLink link parentLink=null labelPrefix=null}
        {if $parentLink && !$link.icon && !$link.iconSrc}
            {if $parentLink.icon}
                {$link.icon = $parentLink.icon}
            {/if}
            {if $parentLink.iconSrc}
                {$link.iconSrc = $parentLink.iconSrc}
            {/if}
        {/if}

        {if $link.href}
            <li class="dashboard-icon-item {$link.cls}" {html_attributes_encode $link prefix='data-' deep=no}>
                <a class="dashboard-icon-link" href="{$link.href|escape}">
                    <figure class="dashboard-icon-ct">
                        <div class="dashboard-icon">
                            <svg class="dashboard-icon-bg"><use xlink:href="{versioned_url img/slate-icons/slate-icons.svg}#icon-squircle"/></svg>
                            {if $link.icon}
                                <svg class="dashboard-icon-glyph"><use xlink:href="{versioned_url img/slate-icons/slate-icons.svg}#icon-{$link.icon}"/></svg>
                            {/if}
                        </div>
                        <figcaption class="dashboard-icon-label">
                            {if $labelPrefix}
                                <small class="muted">{$labelPrefix|escape}</small><br>
                            {/if}
                            {$link.label|escape}
                        </figcaption>
                    </figure>
                </a>
            </li>
        {/if}

        {if $link.children}
            {foreach item=childLink from=$link.children}
                {$parentLabel = $link.shortLabel|default:$link.label}
                {dashboardLink $childLink parentLink=$link labelPrefix=tif($labelPrefix, cat($labelPrefix, ' » ', $parentLabel), $parentLabel)}
            {/foreach}
        {/if}
    {/template}

    <header class="page-header">
        <h1 class="header-title">{$.User->FirstName}’s Dashboard</h1>
    </header>

    <div class="sidebar-layout">
        <div class="main-col">
            <div class="col-inner">
            
                {foreach item=link from=$links}
                    {if $link.children}
                        <section class="dashboard-group" id="{unique_dom_id}{$link.label}{/}">
                            <h2 class="dashboard-group-title">{$link.label|escape}</h2>
                            <ul class="dashboard-icon-list">
                                {foreach item=childLink from=$link.children}
                                    {dashboardLink $childLink parentLink=$link}
                                {/foreach}
                            </ul>
                        </section>
                    {/if}
                {/foreach}
            </div>
        </div>
    
        <div class="sidebar-col">
            <div class="col-inner">
                {include "includes/site.sidebar.tpl"}
            </div>
        </div>
    </div>
{/block}