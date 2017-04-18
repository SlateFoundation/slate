{capture assign=subject}{$Job->getConnectorTitle()} job #{$Job->ID} - Synchronization finished ({$Job->Status}){/capture}
<html>
    <body>
        <style>
            .sync-log article {
                margin-bottom: 2em;
            }
            .sync-log dl {
                margin-left: 2em;
                margin-top: 0;
            }
        </style>

        <h1>Synchronization job status: {$Job->Status}</h1>
        <p><a href="{$connectorBaseUrl}/synchronize/{$Job->Handle}">Results permalink</a></p>

        <h2>Results</h2>
        <pre>{$Job->Results|print_r:true}</pre>

        <h2>Log</h2>
        <div class="sync-log">
        {foreach item=entry from=$Job->logEntries}
            {if $entry.level != 'debug'}
                <div class="log-entry">
                    <div>{\Emergence\Logger::interpolate($entry.message, $entry.context)|escape}</div>

                    {$changes = default($entry.changes, $entry.context.changes)}
                    {if $changes}
                        <dl>
                            {foreach item=delta key=field from=$changes}
                                <dt>{$field}</dt>
                                <dd>{$delta.from|escape} -> {$delta.to|escape}</dd>
                            {/foreach}
                        </dl>
                    {/if}

                    {if $entry.validationErrors}
                        <dl>
                            {foreach item=error key=field from=$entry.validationErrors}
                                <dt>{$field}</dt>
                                <dd>{$error|escape}</dd>
                            {/foreach}
                        </dl>
                    {/if}

                    {if $entry.exception}
                        <details><pre>{$entry.exception|print_r:true|escape}</pre></details>
                    {/if}
                </div>
            {/if}
        {/foreach}
        </div>
    </body>
</html>