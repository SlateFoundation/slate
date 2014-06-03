{extends "designs/site.tpl"}

{block title}Dashboard &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">{$.User->FirstName}’s Dashboard</h2>
    </header>

<div class="sidebar-layout">
    <div class="main-col">
        <div class="col-inner">
            {if !$.cookies.dashboard_welcome_dismissed}
                <div class="well dismissible" data-dismissible-id="dashboard_welcome">
                    <p>Welcome to Slate! Slate ties together all the online tools and services that {Slate::$schoolAbbr} uses so you only have to log in once. Now that you‘re logged in, simply choose a shortcut below or in the top right menu to access the tools you need.</p>
                    <button class="primary dismiss-button">Got it, thanks!</button>
                </div>
            {/if}
        
            {template dashboardItem label url=no labelPrefix=no class=no}
                {if is_string($url)}
                    <li class="shortcut {$class}"><a href="{$url|escape}">{if $labelPrefix}<small class="muted">{$labelPrefix|escape}</small><br>{/if}{$label|escape}</a></li>
                {elseif is_array($url)}
                    {foreach item=subUrl key=subLabel from=$url}
                        {dashboardItem label=$subLabel url=$subUrl labelPrefix=$label}
                    {/foreach}
                {/if}
            {/template}
        
            <h4 class="dashboard-header">Shortcuts</h4>
            <ul class="dashboard-shortcuts">
                {$webTools = Slate::$webTools}
                {dashboardItem label=cat(Slate::$schoolAbbr, ' Homepage') url="/home?nodashboard=1"}
                {foreach item=url key=label from=$webTools}
                    {dashboardItem label=$label url=$url}
                {/foreach}
            </ul>
        
            <h4 class="dashboard-header">Classes</h4>
            <ul class="dashboard-shortcuts">
                {foreach item=Section from=$.User->CurrentCourseSections}
                    <li class="shortcut">
                        <a href="/sections/{$Section->Handle}">
                            {if $Section->Schedule->Title}<span class="pin muted">{$Section->Schedule->Title|escape}</span>{/if}
                            <small>{$Section->Title|escape}</small>
                        </a>
        
                        {foreach item=Mapping from=$Section->Mappings}
                            {if $Mapping->ExternalSource == 'CanvasIntegrator' && $Mapping->ExternalKey == 'course[id]' && RemoteSystems\Canvas::$canvasHost}
                                <div class="shortcut-stub">
                                    <a href="https://{RemoteSystems\Canvas::$canvasHost}/courses/{$Mapping->ExternalIdentifier}" target="_blank">Canvas</a>
                                </div>
                            {/if}
                        {/foreach}
                    </li>
                {foreachelse}
                    <li class="empty"><em class="muted">None this term.</em></li>
                {/foreach}
            </ul>
        
            {if $.User->hasAccountLevel('Staff')}
                {$manageTools = Slate::$manageTools}
        
                <h4 class="dashboard-header">Manage Slate</h4>
                <ul class="dashboard-shortcuts">
                    {foreach $manageTools label url}{dashboardItem $label $url class=manage}{/foreach}
                </ul>
            {/if}
        </div>
    </div>
    
    <div class="sidebar-col">
        <div class="col-inner">
            {include "includes/site.sidebar.tpl"}
        </div>
    </div>
{/block}

{block "js-bottom"}
    {$dwoo.parent}

    <script type="text/javascript">
        Ext.onReady(function(){
            Ext.select('.dismissible').on('click', function(ev, t) {
                var dismissible = ev.getTarget('.dismissible', null, true),
                    dismissibleId = dismissible.getAttribute('data-dismissible-id'),
                    cookieExpires = new Date();

                dismissible.remove();

                if (dismissibleId) {
                    cookieExpires.setFullYear(cookieExpires.getFullYear() + 10);
                    document.cookie = dismissibleId+'_dismissed=1; path=/; expires='+cookieExpires.toGMTString();
                }
            }, null, { delegate: '.dismiss-button' });
        });
    </script>
{/block}