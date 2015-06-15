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
    {template 'dashboardItem' title icon url cls=no}
        <li class="dashboard-icon-item {tif $cls ? $cls : ''}">
            <a class="dashboard-icon-link" href="{$url|default:'#$icon'}">
                <figure class="dashboard-icon-ct">
                    <div class="dashboard-icon">
                        <svg class="dashboard-icon-bg"><use xlink:href="#icon-squircle"/></svg>
                        <svg class="dashboard-icon-glyph"><use xlink:href="#icon-{$icon}"/></svg>
                    </div>
                    <figcaption class="dashboard-icon-label">{$title}</figcaption>
                </figure>
            </a>
        </li>
    {/template}

    <header class="page-header">
        <h1 class="header-title">{$.User->FirstName}’s Dashboard</h1>
    </header>

    <div class="sidebar-layout">
        <div class="main-col">
            <div class="col-inner">
                <section class="dashboard-group" id="recommended">
                    <ul class="dashboard-icon-list">
                        {loop array(
                            array(title => 'Upload Users',   icon => 'users',   url => '/template/enrollments-upload-wizard'),
                            array(title => 'Upload Courses', icon => 'books')
                        )}
                            {dashboardItem url=default($url, '#$icon') title=$title icon=$icon cls=dashboard-item-recommended}
                        {/loop}
                </section>

                <section class="dashboard-group" id="tools">
                    <h2 class="dashboard-group-title">Tools</h2>
                    <ul class="dashboard-icon-list">
                        {loop array(
                            array(title => 'Google Apps for Education', icon => 'gapps'),
                            array(title => 'Gmail',                     icon => 'gmail'),
                            array(title => 'Google Docs',               icon => 'gdrive'),
                            array(title => 'Google Calendar',           icon => 'gcal'),
                            array(title => 'Google Sites',              icon => 'gsites'),
                            array(title => 'Gradebook',                 icon => 'gradebook'),
                            array(title => 'Student Directory',         icon => 'contacts'),
                            array(title => 'Blogs',                     icon => 'rss'),
                            array(title => 'SIS',                       icon => 'id'),
                            array(title => 'LMS',                       icon => 'network'),
                            array(title => 'College Counseling',        icon => 'diploma'),
                            array(title => 'Homepage',                  icon => 'home'),
                            array(title => 'Another Tool',              icon => 'tools'),
                            array(title => 'Another Link'               icon => 'link')
                        )}
                            {dashboardItem url=#$icon title=$title icon=$icon}
                        {/loop}
                    </ul>
                </section>

                <section class="dashboard-group" id="manage">
                    <h2 class="dashboard-group-title">Manage</h2>
                    <ul class="dashboard-icon-list">
                        {loop array(
                            array(title => 'Profile',                   icon => 'user'),
                            array(title => 'Admins',                    icon => 'suit'),
                            array(title => 'Student Records',           icon => 'records'),
                            array(title => 'Users',                     icon => 'users'),
                            array(title => 'Courses',                   icon => 'books'),
                            array(title => 'Narrative Reports',         icon => 'documents',    url => '/template/narrative-reports'),
                            array(title => 'Standards-Based Reports',   icon => 'area-chart',   url => '/template/standards-based-grades'),
                            array(title => 'Progress Notes',            icon => 'notes',        url => '/template/reporting-tool'),
                            array(title => 'Interims Reports',          icon => 'interims',     url => '/template/interim-reports'),
                            array(title => 'Competency-Based Tracker',  icon => ''),
                        )}
                            {dashboardItem url=$url title=$title icon=$icon}
                        {/loop}
                    </ul>
                </section>

                <section class="dashboard-group" id="account">
                    <h2 class="dashboard-group-title">Account</h2>
                    <ul class="dashboard-icon-list">
                        {loop array(
                            array(title => 'Billing',           icon => 'payment'),
                            array(title => 'School Settings',   icon => 'gears'),
                            array(title => 'Personal Settings', icon => 'gearhead'),
                            array(title => 'Export Data',       icon => 'export'),
                        )}
                            {dashboardItem url=#$icon title=$title icon=$icon}
                        {/loop}
                    </ul>
                </section>
            </div>
        </div>
    
        <div class="sidebar-col">
            <div class="col-inner">
                {include "includes/site.sidebar.tpl"}
            </div>
        </div>
    </div>
{/block}