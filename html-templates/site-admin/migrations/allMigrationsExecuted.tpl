{extends migrations.tpl}

{block title}All migrations executed &mdash; {$dwoo.parent}{/block}

{block breadcrumbs}
    <li class="breadcrumb-item"><a href="/site-admin/migrations">Migrations</a></li>
    <li class="breadcrumb-item active">All migrations executed</li>
{/block}

{block content}
    <div class="alert alert-success" role="alert">Executed {$migrations|count} migration(s)</div>

    {foreach item=migration from=$migrations}
        <div class="card mb-3">
            <div class="card-header {tif $migration.status == 'executed' ? 'bg-success text-white'} {tif $migration.status == 'skipped' ? 'bg-info text-white'} {tif $migration.status == 'started' ? 'bg-warning text-white'} {tif $migration.status == 'failed' ? 'bg-danger text-white'}">
                {$migration.status|ucfirst} migration {$migration.key|escape}
            </div>

            <div class="card-body">
                <h5 class="card-title">Script output</h5>
                <samp style="white-space: pre; display: block" class="p-2">{$migration.output|escape}</samp>
            </div>

            <div class="card-body">
                <h5 class="card-title">Query Log</h5>
                <table class="table table-striped">
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
        </div>
    {/foreach}
{/block}