{extends "source.tpl"}

{block title}Diff &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    {$dwoo.parent}
    <li class="breadcrumb-item active">Diff for <code>{$path|escape}</code></li>
{/block}

{block css}
    {$dwoo.parent}
    <style>
        .diff-add {
            background-color: #dbffdb;
        }
        .diff-delete {
            background-color: #ffdddd;
        }
    </style>
{/block}

{block "content"}
    <div class="page-header">
        <h1>{$group|ucfirst} diff for <code>{$path|escape}</code></h1>
    </div>

    {if $error}
        <div class="alert alert-danger"><strong>Failed to get diff:</strong> {$error|escape}</div>
    {else}
        <pre class="bg-light border rounded p-2">{$diff|escape|regex_replace:'/^(\+.*\n)/m':'<span class="diff-add">\$1</span>'|regex_replace:'/^(\-.*\n)/m':'<span class="diff-delete">\$1</span>'}</pre>
    {/if}

    <a href="/site-admin/sources/{$source->getId()|escape}" class="btn btn-secondary">Return to {$source->getId()|escape}</a>
{/block}