{extends "design.tpl"}

{block title}Logs &mdash; {$dwoo.parent}{/block}

{block nav}
    {$activeSection = 'logs'}
    {$dwoo.parent}
{/block}

{block "content"}
    <div class="page-header">
        <h1>Site Logs</h1>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Log</th>
        		<th>Path</th>
        		<th>Size</th>
        		<th>Modified</th>
        	</tr>
        </thead>

        <tbody>
            {foreach item=file from=$files}
        		<tr>
        			<td><a href="/site-admin/logs/{$file.path|escape}">{$file.title|escape}</a></td>
        			<td>{$file.path|escape}</td>
        			<td>{bytes $file.size}</td>
        			<td><time datetime="{html_time $file.modified}">{fuzzy_time $file.modified}</time></td>
        		</tr>
        	{/foreach}
        </tbody>
    </table>
{/block}