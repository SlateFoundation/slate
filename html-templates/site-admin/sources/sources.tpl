{extends "design.tpl"}

{block nav}
    {$activeSection = 'sources'}
    {$dwoo.parent}
{/block}

{block "content"}
    {load_templates "templates.tpl"}

    <div class="page-header">
        <h1>Site Sources</h1>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>Repository ID</th>
            	<th>Commit</th>
        		<th>Working Branch</th>
        		<th>Upstream Branch</th>
        		<th>Status</th>
        	</tr>
        </thead>

        <tbody>
        	{foreach item=source key=id from=$sources}
                {$status = $source->getStatus()}
        		<tr>
        			<td><a href="/site-admin/sources/{$id|escape:url}">{$id|escape}</a></td>
        			<td>{$source->getCommitDescription()|escape}</td>
        			<td>{$source->getWorkingBranch()|escape}</td>
        			<td>{$source->getUpstreamBranch()|escape}</td>
        			<td><span class="badge badge-pill badge-{sourceStatusCls $status}">{$status}</span></td>
        		</tr>
        	{/foreach}
        </tbody>
    </table>
{/block}