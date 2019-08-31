{extends "task.tpl"}

{block content}
    <form method="POST" class="card">
        {if $title}
            <h1 class="card-header">{$title|escape}</h1>
        {/if}

        <div class="card-body">
            <pre class="bg-light border rounded p-2">{$code|escape}</pre>
        </div>

        <div class="card-footer">
            <div class="btn-group" role="group">
                <button type="button" class="btn btn-secondary" onclick="javascript:history.go(-1);">Cancel</button>
                <button type="submit" class="btn btn-primary">Execute</button>
            </div>
        </div>
    </form>
{/block}