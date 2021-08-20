{extends design.tpl}

{block nav}
    {$activeSection = 'migrations'}
    {$dwoo.parent}
{/block}

{block content}
    <div class="page-header">
        <div class="btn-toolbar float-right">
            <form method="POST" action="/site-admin/migrations/!refresh" class="ml-2">
                <button type="submit" class="btn btn-secondary">Refresh inherited migrations</button>
            </form>
            <form method="POST" action="/site-admin/migrations/!all" class="ml-2">
                <button type="submit" class="btn btn-primary">Execute all</button>
            </form>
        </div>

        <h1>Migrations</h1>
    </div>

    <table class="table table-striped">
        <thead>
            <tr>
                <th scope="col">Migration</th>
                <th scope="col">Status</th>
                <th scope="col">Timestamp</th>
                <th scope="col"></th>
            </tr>
        </thead>

        <tbody>
            {foreach item=migration from=$migrations}
                <tr class="{tif $migration.status == executed ? 'bg-success text-white'} {tif $migration.status == skipped ? 'bg-light text-muted'} {tif $migration.status == started ? 'bg-warning text-white'} {tif $migration.status == failed ? 'bg-danger text-white'}">
                    <td class="migration-id"><a href="/site-admin/migrations/{$migration.key|escape}" class="{tif $migration.status != new && $migration.status != skipped ? 'text-light'}">{$migration.key|escape}</a><br><small>SHA1: {$migration.sha1}</td>
                    <td class="migration-status">{$migration.status}</td>
                    <td class="migration-timestamp">{$migration.executed}</td>
                    <td class="migration-action">
                        {if $migration.status != 'executed'}
                            <form class="execute-migration" action="/site-admin/migrations/{$migration.key|escape}" method="POST">
                                {if $migration.status == 'new'}
                                    <button type="submit" class="btn btn-primary">Execute</button>
                                {elseif $migration.status == 'started' || $migration.status == 'failed'}
                                    <input type="hidden" name="force" value="yes">
                                    <button type="submit" class="btn btn-danger">Force re-execute</button>
                                {/if}
                            </form>
                        {/if}
                    </td>
                </tr>
            {/foreach}
        </tbody>
    </table>
{/block}