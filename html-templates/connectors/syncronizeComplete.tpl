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
        .sync-log .level-emergency  { color: darkred; font-weight: bold; }
        .sync-log .level-alert      { color: darkred; font-weight: bold; }
        .sync-log .level-critical   { color: red; font-weight: bold; }
        .sync-log .level-error      { color: orangered; font-weight: bold; }
        .sync-log .level-warning    { color: orangered; }
        .sync-log .level-notice     { color: orange; }
        .sync-log .level-info       { color: skyblue; }
        .sync-log .level-debug      { color: lightgray; display: none; }

        .sync-log.show-debug .level-debug {
            display: block;
        }
    </style>
{/block}

{block content}
    {$Job = $data}
    <h1>Synchronization job status: {$Job->Status}</h1>

    {if $Job->isPhantom}
        <p><strong>Pretend mode active: no changes have actually been applied. Re-run job without pretend mode to apply</strong></p>
    {else}
        <p><a href="{$connectorBaseUrl}/synchronize/{$Job->Handle}">Results permalink</a></p>
    {/if}

    <h2>Results</h2>
    <pre>{$Job->Results|print_r:true}</pre>

    <h2>Log</h2>
    <label><input type="checkbox" onchange="document.querySelector('.sync-log').classList.toggle('show-debug', this.checked)">Show debug entries</label>
    <section class="sync-log">
    {foreach item=entry from=$Job->logEntries}
        <article class="level-{$entry.level}">
            <div>{\Emergence\Logger::interpolate($entry.message, $entry.context)|escape}</div>

            {$changes = default($entry.changes, $entry.context.changes)}
            {if $changes}
                <dl>
                    {foreach item=delta key=field from=$changes->getDiff()}
                        <dt>{$field}</dt>
                        <dd>{default($delta.old, '∅')|escape} &rarr; {default($delta.new, '∅')|escape}</dd>
                    {/foreach}
                </dl>
            {/if}

            {$validationErrors = default($entry.validationErrors, $entry.context.validationErrors)}
            {if $validationErrors}
                <dl>
                    {foreach item=error key=field from=$validationErrors}
                        <dt>{$field}</dt>
                        <dd>{$error|escape}</dd>
                    {/foreach}
                </dl>
            {/if}

            {*if $entry.exception}
                <details><pre>{$entry.exception|print_r:true|escape}</pre></details>
            {/if*}
        </article>
    {/foreach}
    </section>
{/block}