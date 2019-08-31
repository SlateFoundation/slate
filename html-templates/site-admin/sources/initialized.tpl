{extends "source.tpl"}

{block title}Repository Initialized &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    {$dwoo.parent}
    <li class="breadcrumb-item active">{icon "play-circle"} Repository Initialized</li>
{/block}

{block "content"}
    <div class="page-header">
        <h1>Repository Initialized</h1>
    </div>

    <p class="lead alert alert-success">Repository <a href="/site-admin/sources/{$source->getId()|escape}">{$source->getId()|escape}</a> has been initialized</p>
{/block}