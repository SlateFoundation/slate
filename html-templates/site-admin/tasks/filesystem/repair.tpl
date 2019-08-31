{extends "task.tpl"}

{block content}
    {if $message}
        <pre class="alert alert-info" role="alert">{$message|escape|markdown}</pre>
    {/if}

    <form method="POST" class="card">
        <div class="card-header">Repair options</div>

        <div class="card-body">
            <div class="checkbox">
                <label>
                    <input type="checkbox" name="ops[]" value="erase-unused" {refill field=ops checked=erase-unused default=erase-unused}>
                    Erase unused collections
                </label>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="ops[]" value="erase-orphans" {refill field=ops checked=erase-orphans}>
                    Erase orphaned nodes
                </label>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="ops[]" value="merge-ghost-collections" {refill field=ops checked=merge-ghost-collections default=merge-ghost-collections}>
                    Merge ghost collections
                </label>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="ops[]" value="renest" {refill field=ops checked=renest default=renest}>
                    Renest collections
                </label>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="ops[]" value="clear-cache" {refill field=ops checked=clear-cache default=clear-cache}>
                    Clear cache
                </label>
            </div>

            <button type="submit" class="btn btn-primary">Repair filesystem</button>
        </div>
    </form>
{/block}