{extends "source.tpl"}

{block title}Working Tree Updated from VFS &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    {$dwoo.parent}
    <li class="breadcrumb-item active">Working Tree Updated from VFS</li>
{/block}

{block css}
    {$dwoo.parent}
    <style>
    .column-group-first {
        border-left: 1px solid black;
    }
    </style>
{/block}

{block "content"}
    <div class="page-header">
        <h1>Working Tree Updated from VFS</h1>
    </div>

    <table class="table">
        <thead>
            <tr>
                <td></td>
                <th colspan="2" class="text-center column-group-first">Collections</th>
                <th colspan="4" class="text-center column-group-first">Files</th>
            </tr>
            <tr>
                <th>Path</th>
                <th class="text-center column-group-first">Analyzed</th>
                <th class="text-center">Excluded</th>
                <th class="text-center column-group-first">Analyzed</th>
                <th class="text-center">Excluded</th>
                <th class="text-center">Written</th>
                <th class="text-center">Deleted</th>
            </tr>
        </thead>
        <tbody>
            {foreach key=path item=result from=$results}
                <tr>
                    <td>{$path|escape}</td>
                    <td class="text-center column-group-first">{$result.collectionsAnalyzed|number_format}</td>
                    <td class="text-center">{$result.collectionsExcluded|number_format}</td>
                    <td class="text-center column-group-first">{$result.filesAnalyzed|number_format}</td>
                    <td class="text-center">{$result.filesExcluded|number_format}</td>
                    <td class="text-center">{$result.filesWritten|number_format}</td>
                    <td class="text-center">{$result.filesDeleted|number_format}</td>
                </tr>
            {/foreach}
        </tbody>
    </table>

    <a href="/site-admin/sources/{$source->getId()|escape}" class="btn btn-secondary">Return to {$source->getId()|escape}</a>
{/block}