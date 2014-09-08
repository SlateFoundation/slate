{extends designs/site.tpl}

{block title}Import Google Sheets &mdash; {$dwoo.parent}{/block}

{block content}
    <h1>Pull from Google Sheet</h1>
	<h2>Instructions</h2>
	<ul>
		<li>Set the Google Sheet sharing options so that <strong>anyone with a link</strong> can <strong>view</strong></li>
		<li>Open the sharing link in an incognito Chrome window and open the Network inspector</li>
		<li>Activate the desired worksheet and select File &rarr; Download as &rarr; Comma-seperated values (.csv, current sheet)</li>
        <li>Find the red <strong>export</strong> request in the network log, right click it, and select <strong>Copy link address</strong></li>
	</ul>

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
            <legend>Job Mode</legend>
    		<p>
    			<label>
    				Pretend
    				<input type="checkbox" name="pretend" value="true" {refill field=pretend checked="true" default="true"}>
    			</label>
    			(Check to prevent saving any changes to the database)
    		</p>
    		<p>
    			<label>
    				Verbose
    				<input type="checkbox" name="verbose" value="true" {refill field=verbose checked="true" default="true"}>
    			</label>
    			(Check to see detailed output about what changes will be/have been made)
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
        </fieldset>
        <fieldset>
            <legend>User Accounts</legend>
            <p>
    			<label>
    				Students CSV
    				<input type="text" name="studentsCsv" {refill field=studentsCsv} length="255">
    			</label>
    			URL captured by downloading a <strong>Students</strong> worksheet as CSV from a public link
    		</p>
            <p>
        		<label>
    				Staff CSV
    				<input type="text" name="staffCsv" {refill field=staffCsv} length="255">
    			</label>
    			URL captured by downloading a <strong>Staff</strong> worksheet as CSV from a public link
    		</p>
        </fieldset>
        <fieldset>
            <legend>Courses Sections & Enrollments</legend>
    		<p>
    			<label>
    				Master Term
    				<select name="masterTerm">
                        {foreach item=Term from=Slate\Term::getAllMaster()}
    						<option value="{$Term->Handle}" {refill field=masterTerm selected=$Term->Handle}>{$Term->Title|escape}</option>
    					{/foreach}
    				</select>
                    For sections and schedules, the school year to import in to
    			</label>
    		</p>
            <p>
            	<label>
    				Sections CSV
    				<input type="text" name="sectionsCsv" {refill field=sectionsCsv} length="255">
    			</label>
    			URL captured by downloading a <strong>Course Sections</strong> worksheet as CSV from a public link
    		</p>
            <p>
            	<label>
    				Enrollments CSV
    				<input type="text" name="enrollmentsCsv" {refill field=enrollmentsCsv} length="255">
    			</label>
    			URL captured by downloading a <strong>Enrollments</strong> worksheet as CSV from a public link
    		</p>
        </fieldset>

		<input type="submit" value="Synchronize">
	</form>
{/block}