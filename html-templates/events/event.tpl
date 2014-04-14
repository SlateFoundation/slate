{extends "designs/site.tpl"}

{block title}{$data->Title|escape} &mdash; Events &mdash; {$dwoo.parent}{/block}

{block "content"}
	{$Event = $data}
	
	<h2 class="event-title">{$Event->Title|escape}</h2>
	<dl class="property-list well">
		{if $Event->Feed}
		    <div class="dli">
    			<dt>Calendar</dt>
    			<dd><a href="{$Event->Feed->Link|escape}" class="ical">{$Event->Feed->Title|escape}</a></dd>
		    </div>
		{/if}

		<div class="dli">
    		<dt>Starts</dt>
    		<dd>{$Event->StartTime|date_format:'%A, %b %-e, %Y @ %-l:%M %P'}</dd>
		</div>

		<div class="dli">
    		<dt>Ends</dt>
    		<dd>{$Event->EndTime|date_format:'%A, %b %-e, %Y @ %-l:%M %P'}</dd>
		</div>

		{if $Event->Location}
		    <div class="dli">
    			<dt>Location</dt>
    			<dd>{$Event->Location|escape}</dd>
		    </div>
		{/if}

	</dl>
	
	{if $Event->Description}<div class="event-description">{$Event->Description|escape|markdown}</div>{/if}

	<aside class="comments">
		<a name="comments"></a>
		<h3>Comments</h3>
		{commentForm $Event}
		{commentsList $Event->Comments}
	</aside>
{/block}