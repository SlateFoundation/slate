{extends "design.tpl"}

{block title}{$path|escape} &mdash; {$dwoo.parent}{/block}

{block nav}
    {$activeSection = 'logs'}
    {$dwoo.parent}
{/block}

{block breadcrumbs}
    <li class="breadcrumb-item"><a href="/site-admin/logs">Logs</a></li>
    <li class="breadcrumb-item active">{$path|escape}</li>
{/block}

{block "content"}
    <div class="page-header">
        <div class="btn-toolbar float-right">
            <div class="btn-group">
                <a href="?{refill_query download=raw}" class='btn btn-primary'>
                    {icon "download"}
                    Download
                </a>
            </div>
        </div>
        <h1>Site Log: <code>{$path|escape}</code></h1>
    </div>

    <em>Showing last {$lines|number_format} lines (<a href="?lines={$lines * 10}">more&hellip;</a>):</em>
    <pre class="bg-light border rounded p-2">{$tail|escape}</pre>
{/block}