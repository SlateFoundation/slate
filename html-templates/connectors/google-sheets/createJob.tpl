{extends designs/site.tpl}

{block title}Pull from Google Sheets &mdash; {$dwoo.parent}{/block}

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
            <legend>Job Configuration</legend>
    		<p>
    			<label>
    				Pretend
    				<input type="checkbox" name="pretend" value="true" {refill field=pretend checked="true" default="true"}>
    			</label>
    			<span class="hint">Check to prevent saving any changes to the database</span>
    		</p>
    		<p>
    			<label>
    				Create Template
    				<input type="checkbox" name="createTemplate" value="true" {refill field=createTemplate checked="true"}>
    			</label>
    			<span class="hint">Check to create a template job that can be repeated automatically instead of running it now</span>
    		</p>
        	<p>
    			<label>
    				Email report
    				<input type="text" name="reportTo" value="{refill field=reportTo}" length="100">
    			</label>
    			<span class="hint">Email recipient or list of recipients to send post-sync report to</span>
    		</p>
            <p>
    			<label>
    				Auto Capitalize
    				<input type="checkbox" name="autoCapitalize" value="true" {refill field=autoCapitalize checked="true"}>
    			</label>
    			<span class="hint">Check to make best-case at correct capitalization for proper nouns if input case is mangled</span>
    		</p>
        	<p>
    			<label>
    				Master Term
    				<select name="masterTerm">
                        {foreach item=Term from=Slate\Term::getAllMaster()}
    						<option value="{$Term->Handle}" {refill field=masterTerm selected=$Term->Handle}>{$Term->Title|escape}</option>
    					{/foreach}
    				</select>
    			</label>
                <span class="hint">For sections and schedules, the school year to import in to. Also used when converting grade levels to graduation years.</span>
    		</p>
        </fieldset>
        <fieldset>
            <legend>User Accounts</legend>
            <p>
        		<label>
    				Update usernames
    				<input type="checkbox" name="updateUsernames" value="true" {refill field=updateUsernames checked="true"}>
    			</label>
    			<span class="hint">Check to change a user's username if the site's configured generator comes up with a new one</span>
    		</p>
            <p>
        		<label>
    				Update passwords
    				<input type="checkbox" name="updatePasswords" value="true" {refill field=updatePasswords checked="true"}>
    			</label>
    			<span class="hint">Check to change a existing users' passwords if one is specified in the sheet</span>
    		</p>
            <p>
                <label>
    				Update about text
    				<input type="checkbox" name="updateAbout" value="true" {refill field=updateAbout checked="true"}>
    			</label>
    			<span class="hint">Check to change set a user's About text from the spreadsheet even if they already have an entry</span>
    		</p>
            <p>
                <label>
    				Match existing users with full names
    				<input type="checkbox" name="matchFullNames" value="true" {refill field=matchFullNames checked="true"}>
    			</label>
    			<span class="hint">Check to try to match existing users by their first/last name if no unique ID match succeeds</span>
    		</p>
            <p>
                <label>
    				Auto-assign email address
    				<input type="checkbox" name="autoAssignEmail" value="true" {refill field=autoAssignEmail checked="true" default="true"}>
    			</label>
    			<span class="hint">Check to automatically assign an email address if the spreadsheet provides none and <code>Slate::$userEmailDomain</code> is set</span>
    		</p>
            <p>
                <label>
                    Clear existing groups
                    <input type="checkbox" name="clearGroups" value="true" {refill field=clearGroups checked="true"}>
                </label>
                <span class="hint">Check to remove any existing group assignments that are not present in the incoming data</span>
            </p>
            <p>
        		<label>
    				Students CSV
    				<input type="text" name="studentsCsv" value="{refill field=studentsCsv}" length="255">
    			</label>
    			<span class="hint">URL captured by downloading a <strong>Students</strong> worksheet as CSV from a public link</span>
    		</p>
            <p>
        		<label>
    				Alumni CSV
    				<input type="text" name="alumniCsv" value="{refill field=alumniCsv}" length="255">
    			</label>
    			<span class="hint">URL captured by downloading a <strong>Alumni</strong> worksheet as CSV from a public link</span>
    		</p>
            <p>
        		<label>
    				Staff CSV
    				<input type="text" name="staffCsv" value="{refill field=staffCsv}" length="255">
    			</label>
    			<span class="hint">URL captured by downloading a <strong>Staff</strong> worksheet as CSV from a public link</span>
    		</p>
        </fieldset>
        <fieldset>
            <legend>Courses Sections & Enrollments</legend>
            <p>
            	<label>
    				Sections CSV
    				<input type="text" name="sectionsCsv" value="{refill field=sectionsCsv}" length="255">
    			</label>
    			<span class="hint">URL captured by downloading a <strong>Course Sections</strong> worksheet as CSV from a public link</span>
    		</p>
            <p>
            	<label>
    				Enrollments CSV
    				<input type="text" name="enrollmentsCsv" value="{refill field=enrollmentsCsv}" length="255">
    			</label>
    			<span class="hint">URL captured by downloading a <strong>Enrollments</strong> worksheet as CSV from a public link</span>
    		</p>
            <p>
                <label>
                    Course Code Seperator
                    <input type="text" name="enrollmentDivider" value="{refill field=enrollmentDivider}" length="5">
                </label>
                <span class="hint">If more then one course code is present in each cell, specify the character that divides each course here</span>
            </p>
        </fieldset>

		<input type="submit" value="Synchronize">
	</form>
{/block}