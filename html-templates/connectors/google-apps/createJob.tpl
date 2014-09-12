{extends designs/site.tpl}

{block title}Push to Google Apps &mdash; {$dwoo.parent}{/block}

{block content}
    <h1>Push to Google Apps</h1>

	<h2>Input</h2>
    <h3>Run from template</h3>
    <ul>
        {foreach item=TemplateJob from=$templates}
            <li><a href="{$connectorBaseUrl}/synchronize/{$TemplateJob->Handle}" title="{$TemplateJob->Config|http_build_query|escape}">Job #{$TemplateJob->ID} &mdash; created by {$TemplateJob->Creator->Username} on {$TemplateJob->Created|date_format:'%c'}</a></li>
        {/foreach}
    </ul>

    <h3>Run or save a new job</h3>
	<form method="POST">
        <fieldset>
            <legend>Job Configuration</legend>
    		<p>
    			<label>
    				Pretend
    				<input type="checkbox" name="pretend" value="true" {refill field=pretend checked="true" default="true"}>
    			</label>
    			(Check to prevent saving any changes to the database)
    		</p>
    		<p>
    			<label>
    				Create Template
    				<input type="checkbox" name="createTemplate" value="true" {refill field=createTemplate checked="true"}>
    			</label>
    			(Check to create a template job that can be repeated automatically instead of running it now)
    		</p>
            <p>
    			<label>
    				Email report
    				<input type="text" name="reportTo" {refill field=reportTo} length="100">
    			</label>
    			Email recipient or list of recipients to send post-sync report to
    		</p>
            <p>
    			<label>
    				OAuth Token
    				<input type="text" name="apiToken" {refill field=apiToken} length="100">
    			</label>
    			(<a href="https://developers.google.com/apis-explorer/#p/admin/directory_v1/directory.users.list?domain={Slate::$userEmailDomain|escape:url}&_h=2&">steal one here</a>)
    		</p>
        	<p>
    			<label>
    				Push Users
    				<input type="checkbox" name="pushUsers" value="true" {refill field=pushUsers checked="true" default="true"}>
    			</label>
    			Check to push users to Google Apps
    		</p>
        </fieldset>

		<input type="submit" value="Synchronize">
	</form>
{/block}