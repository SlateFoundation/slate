<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
</head>
<body>
{$gradeLabels = array(
	"N/A" = "Standard not Applicable during the Semester"
	,1 = "Not currently meeting expectations"
	,2 = "Approaching expectations"
	,3 = "Meeting expectations"
	,4 = "Exceeding expectations"
)}
{$lastReport = false}

<section class="student">
{foreach item=Grade from=$data}


	{if $lastGrade && ($lastGrade->Section->ID != $Grade->Section->ID || $lastGrade->StudentID != $Grade->StudentID)}
		</tbody>
	</table>
	</article>
	{/if}

	{if $lastGrade->StudentID != $Grade->StudentID}
		{if $lastGrade}
</section><section class="student">
		{/if}
		<header>
			<h1>
				<span class="pretitle">Standards-Based Report Card for</span>
				{$Grade->Student->FullName}
			</h1>
			{if $Grade->Student->Advisor}
				<h2 class="advisor">
					Advisor: {$Grade->Student->Advisor->FullName}
					&lt;<a href="mailto:{$Grade->Student->Advisor->Email}">{$Grade->Student->Advisor->Email}</a>&gt;
				</h2>
			{/if}
			<h3 class="term">{$Grade->Term->Title|escape}</h3>
		</header>
		
		<p>During the 2011&ndash;12 school year, following the 2<sup>nd</sup> and 4<sup>th</sup> quarters, all SLA students will receive a Standards-Based Report Card in addition to their School District of Philadelphia Report Card. The Standards-Based Report Card is meant to communicate information about each student&rsquo;s progress towards meeting core standards, which have been developed by each department. They are solely meant to serve as informative tools for both students and parents (i.e. they will not be sent to colleges with students&rsquo; transcripts). If you have any questions, please feel free to contact me or your student&rsquo;s advisor.</p>
		<p>&mdash; Brad Latimer<br />blatimer@scienceleadership.org<br />Academic Standards Committee Chair</p>
		
		{*
		<h2>Key</h2>
		<dl class="key">
			<div>
				<dt>N/A</dt>
				<dd>Standard not Applicable during the Semester</dd>
			</div>

			<div>
				<dt>1</dt>
				<dd>Student not currently meeting expectations</dd>
			</div>

			<div>
				<dt>2</dt>
				<dd>Student is approaching expectations</dd>
			</div>

			<div>
				<dt>3</dt>
				<dd>Student is meeting expectations</dd>
			</div>

			<div>
				<dt>4</dt>
				<dd>Student is exceeding expectations</dd>
			</div>
		</dl>
		*}
	{/if}
	

		{if $lastGrade->Section->ID != $Grade->Section->ID}
			<article class="standard-worksheet">
			<h2>{$Grade->Section->Title|escape}</h2>

			<dl>
			{if $Grade->Section->Instructors[0]->FullName}
				<dt class="instructor" style="font-weight: bold">Instructor</dt>
				<dd class="instructor">
					{$Grade->Section->Instructors[0]->FullName}
					{if $Grade->Section->Instructors[0]->Email}
						<a href="mailto:{$Grade->Section->Instructors[0]->Email}">&lt;{$Grade->Section->Instructors[0]->Email}&gt;</a>
					{/if}
				</dd>
			{/if}
		
			{if $Grade->WorksheetAssignment->Description}
				<dt class="description" style="font-weight: bold">Notes on Assessment</dt>
				<dd class="description">{$Grade->WorksheetAssignment->Description|escape|nl2br}</dd>
			{/if}
			</dl>
			
			<table class="prompts" width="100%">
				<thead>
					<tr>
						<th class="prompt">Standard</th>
						<th class="grade mid">Mid-Year</th>
						{*<th class="grade end">Year End</th>*}
					</tr>
				</thead>
				<tbody>
		{/if}
		
		<tr>
			<td class="prompt">{$Grade->Prompt->Prompt|escape}</td>
			<td class="grade mid">{if $Grade->Grade != "N/A"}{$gradeLabels[$Grade->Grade]}{else}{$Grade->Grade}{/if}</td>
			{*<td class="grade end">{if $Grade->Grade != "N/A"}{$gradeLabels[$Grade->Grade]}{else}{$Grade->Grade}{/if}</td>*}
		</tr>
				
		{if $lastGrade->Section->ID != $Grade->Section->ID}
		{/if}
		
	
	{$lastGrade = $Grade}
{/foreach}

{if count($data)}
		</tbody>
	</table>
	</article>
{/if}
</section>

</body>
</html>