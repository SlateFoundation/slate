{extends designs/site.tpl}

{block title}Job #{$data->ID} Status &mdash; {$dwoo.parent}{/block}

{block content}
    {$Job = $data}
    <h1>Job #{$Job->ID} <small>{$Job->Status}</small></h1>

    {if $Job->Template}
        <p>Spawned from template <a href="{$connectorBaseUrl}/synchronize/{$Job->Template->Handle}">#{$Job->Template->ID}</a></p>
    {/if}

    {if $Job->Config}
        <details open>
            <summary>Configuration</summary>
            <pre>{$Job->Config|print_r:true|escape}</pre>
        </details>
    {/if}

    {if $Job->Results}
        <details open>
            <summary>Results</summary>
            <pre>{$Job->Results|print_r:true|escape}</pre>
        </details>
    {/if}

    {if $Job->Status == 'Template'}
        <h2>Latest jobs run from this template</h2>

        <form method="POST" action="{$connectorBaseUrl}/synchronize?template={$Job->Handle}">
            <input type="submit" value="Spawn a new job from this template">
        </form>
        <table width="100%">
            <tr>
                <th>Job ID</th>
                <th align="right">Created</th>
                <th>Creator</th>
                <th align="right">Status</th>
            </tr>
            {foreach item=TemplatedJob from=$Job->TemplatedJobs}
                <tr>
                    <td><a href="{$connectorBaseUrl}/synchronize/{$TemplatedJob->Handle}">{$TemplatedJob->ID}</a></td>
                    <td align="right">{$TemplatedJob->Created|date_format:'%c'}</td>
                    <td>{personLink $TemplatedJob->Creator}</td>
                    <td align="right">{$TemplatedJob->Status}</td>
                </tr>
                {if $TemplatedJob->Config}
                    <tr>
                        <td colspan="3">
                            <details>
                                <summary>Configuration</summary>
                                <pre>{$TemplatedJob->Config|print_r:true|escape}</pre>
                            </details>
                        </td>
                    </tr>
                {/if}
                {if $TemplatedJob->Results}
                    <tr>
                        <td colspan="3">
                            <details>
                                <summary>Results</summary>
                                <pre>{$TemplatedJob->Results|print_r:true|escape}</pre>
                            </details>
                        </td>
                    </tr>
                {/if}
            {/foreach}
        </table>
    {else}
        <p><a href="{$connectorBaseUrl}/synchronize/{$Job->Handle}/log">Download log file</a></p>
    {/if}
{/block}