{extends migration.tpl}

{block title}Executed: {$dwoo.parent}{/block}

{block breadcrumbs}
    <li class="breadcrumb-item"><a href="/site-admin/migrations">Migrations</a></li>
    <li class="breadcrumb-item"><a href="/site-admin/migrations/{$migration.key}">{$migration.key}</a></li>
    <li class="breadcrumb-item active">Results</li>
{/block}

{block content}

    {if $migration.status == executed}
        <div class="alert alert-success" role="alert">Migration executed</div>
    {elseif $migration.status == skipped}
        <div class="alert alert-info" role="alert">Migration skipped</div>
    {/if}

    {$dwoo.parent}

    <div class="card">
        <div class="card-header">Query Log</div>
        <table class="card-body table table-striped">
            <thead>
                <tr>
                    <th scope="col">Query</th>
                    <th scope="col">Rows</th>
                    <th scope="col">Time</th>
                </tr>
            </thead>

            <tbody>
                {foreach item=entry from=$migration.queryLog}
                    <tr>
                        <td>{$entry.query|escape}</td>
                        <td>{$entry.affected_rows|default:entry.result_rows|number_format}</td>
                        <td>{$entry.time_duration_ms|number_format:2}ms</td>
                    </tr>
                {/foreach}
            </tbody>
        </table>
    </div>
{/block}