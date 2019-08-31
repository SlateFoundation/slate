{extends "task.tpl"}

{block content}

    <div class="card">
        <div class="card-header">Application Cache Contents</div>

        <table class="table table-striped">
            <thead>
                <tr>
                    <th scope="col">Key</th>
                    <th scope="col">Hits</th>
                    <th scope="col">Size</th>
                    <th scope="col">Accessed</th>
                    <th scope="col">Created</th>
                    <th scope="col">Modified</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {foreach item=entry key=key from=$entries}
                    <tr>
                        <th scope="row">{$key|escape}</th>
                        <td>{$entry.hits|number_format}</td>
                        <td>{bytes $entry.size}</td>
                        <td><time datetime="{html_time $entry.accessTime}">{fuzzy_time $entry.accessTime}</time></td>
                        <td><time datetime="{html_time $entry.createTime}">{fuzzy_time $entry.createTime}</time></td>
                        <td><time datetime="{html_time $entry.modifyTime}">{fuzzy_time $entry.modifyTime}</time></td>
                        <td width="70">
                            <div class="btn-group btn-group-sm" role="group">
                                <a href="{$.task.baseUrl}/{$key|escape:url}" class="btn btn-secondary">{icon "search-plus"}</a>
                                <a href="{$.task.baseUrl}/{$key|escape:url}/delete" class="btn btn-danger">{icon "trash"}</a>
                            </div>
                        </td>
                    </tr>
                {/foreach}
            </tbody>
        </table>
    </div>

{/block}