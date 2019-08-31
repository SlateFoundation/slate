{extends "task.tpl"}

{block content}
    {if $changes}
        <div class="alert alert-info" role="alert">
            <strong>Updated degredations:</strong>
            <ul>
            {foreach item=value key=key from=$changes}
                <li>{$key|escape}: {tif $value ? 'on' : 'off'}</li>
            {/foreach}
            </ul>
        </div>
    {/if}

    <form method="POST" class="card">
        <div class="card-header">Configured degredations</div>

        <div class="card-body">
            {foreach item=value key=key from=$degredations}
                <input type="hidden" name="degredations[{$key|escape}]" value="off">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" name="degredations[{$key|escape}]" value="on" {tif $value ? checked}>
                        {$key|escape}
                    </label>
                </div>
            {/foreach}

            <div class="form-group">
                <input type="text" placeholder="new-key" name="enable[]">
            </div>

            <button type="submit" class="btn btn-primary">Apply Degredations</button>
        </div>
    </form>
{/block}