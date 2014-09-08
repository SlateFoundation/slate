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
        <section class="sync-log">
        {foreach item=entry from=$Job->log}
            <article>
                {$entry.message|escape}

                {if $entry.changes}
                    <dl>
                        {foreach item=delta key=field from=$entry.changes}
                            <dt>{$field}</dt>
                            <dd>{$delta.from|escape} -> {$delta.to|escape}</dd>
                        {/foreach}
                    </dl>
                {/if}

                {if $entry.exception}
                    <details><pre>{$entry.exception|print_r:true|escape}</pre></details>
            </article>
        {/foreach}
        </section>
    </body>
</html>