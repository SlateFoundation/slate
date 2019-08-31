{extends "task.tpl"}

{block content}

    <div class="card">
        <div class="card-header">Application Cache: <code>{$entryKey|escape}</code></div>

        <div class="card-body">
            <dl class="row">
                <dt class="col-2 text-right">Key</dt>
                <dd class="col-10"><code>{$entryKey|escape}</code></dd>

                <dt class="col-2 text-right">Hits</dt>
                <dd class="col-10">{$entry.hits|number_format}</dd>

                <dt class="col-2 text-right">Size</dt>
                <dd class="col-10">{bytes $entry.size}</dd>

                <dt class="col-2 text-right">Accessed</dt>
                <dd class="col-10"><time datetime="{html_time $entry.accessTime}">{fuzzy_time $entry.accessTime}</time></dd>

                <dt class="col-2 text-right">Created</dt>
                <dd class="col-10"><time datetime="{html_time $entry.createTime}">{fuzzy_time $entry.createTime}</time></dd>

                <dt class="col-2 text-right">Modified</dt>
                <dd class="col-10"><time datetime="{html_time $entry.modifyTime}">{fuzzy_time $entry.modifyTime}</time></dd>

                <dt class="col-2 text-right">Value</dt>
                <dd class="col-10"><pre class="bg-light border rounded p-2">{$entry.value|var_export:true|escape}</pre></dd>
            </dl>
        </div>
    </div>

{/block}