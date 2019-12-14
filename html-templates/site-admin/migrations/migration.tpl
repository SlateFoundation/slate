{extends migrations.tpl}

{block title}{$migration.key} &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    <li class="breadcrumb-item"><a href="/site-admin/migrations">Migrations</a></li>
    <li class="breadcrumb-item active">{$migration.key}</li>
{/block}

{block content}
    <div class="card mb-3 {tif $migration.status == executed ? 'bg-success text-white'} {tif $migration.status == skipped ? 'bg-info text-white'} {tif $migration.status == started ? 'bg-warning text-white'} {tif $migration.status == failed ? 'bg-danger text-white'}">
        <div class="card-header">
            {if $migration.status == new}
                <form action="/site-admin/migrations/{$migration.key|escape}" method="POST" class="btn-group btn-group-sm float-right">
                    <button type="submit" class="btn btn-primary">Execute</button>
                </form>
            {/if}

            Migration {$migration.key|escape}
        </div>

        <div class="card-body">
            <dl class="row">
                {foreach item=value key=key from=$migration}
                    <dt class="col-2 text-right">{$key|escape}</dt>
                    <dd class="col-10">{$value|escape}</dd>
                {/foreach}
            </dl>
        </div>
    </div>

    <div class="card mb-3">
        <div class="card-header">Script output</div>
        <div class="card-body">
            <samp style="white-space: pre; display: block" class="p-2">{$migration.output|escape}</samp>
        </div>
    </div>
{/block}