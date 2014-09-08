{extends designs/site.tpl}

{block title}Job Finished &mdash; {$dwoo.parent}{/block}

{block css}
    {$dwoo.parent}
    <style>
        .sync-log article {
            margin-bottom: 2em;
        }
        .sync-log dl {
            margin-left: 2em;
            margin-top: 0;
        }
    </style>
{/block}

{block content}
    {$Job = $data}
    <h1>Synchronization job status: {$Job->Status}</h1>

    {if $Job->isPhantom}
        <p><em>Pretend mode: no changes have actually been applied. Re-run job without pretend mode to apply</em></p>
    {else}
        <p><a href="{$connectorBaseUrl}/synchronize/{$Job->Handle}">Results permalink</a></p>
    {/if}

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
        </article>
    {/foreach}
    </section>
{/block}