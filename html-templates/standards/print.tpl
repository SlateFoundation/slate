<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style type="text/css">
body, dd, li, p {
	font-family: Palatino Linotype, Book Antiqua, Palatino, serif !important;
	font-size: 13pt !important;
}
body {
	margin: auto;
	orphans: 3;
	padding: .25in 0.5in;
	width: 11in;
	widows: 3;
}
header, h1, h2, h3,
dt,
th,
td.grade {
	font-family: Helvetica Neue, Helvetica, Arial, Verdana, sans-serif !important;
}
p {
	margin: 1em 0 0 !important;
}
a, a:link, a:visited {
	color: #666;
	font-family: Consolas, Menlo, Monaco, Courier, monospace;
	font-size: 12pt; 
	text-decoration: none;
}
header {
	display: block;
	border-bottom: 1px solid #666;
	padding-bottom: 0.25em;
}
.student {
	page-break-before: always;
	border-bottom: 1px dotted #999;
	margin-bottom: 2em;
	padding-bottom: 1em;
}
.student:first-of-type {
	page-break-before: auto;
}
.student:last-child {
	border-bottom: 0;
}
header h1 {
	font-size: 24pt;
	margin: 0;
}
header h1 .pretitle {
	display: block;
	font-size: 12pt;
}
header h3 {
	font-size: 12pt;
	margin: 1em 0 0;
}
header .advisor {
	float: right;
	font-size: 12pt;
	font-weight: 900;
	line-height: 8pt;
	padding-top: 20pt;
	text-align: right;
}
header .advisor a {
	display: block;
	font-size: 10pt;
	font-weight: normal;
	line-height: 18pt;
	text-align: center;
}
dt {
	font-weight: bold;
}

dd {
	margin: .5em 0;
}

.key dt {
	color: black;
	display: inline-block;
	float: none;
	font-size: 12pt;
	font-weight: bold;
	margin-right: .5em;
	text-align: right;
	width: 2.5em;
}

.key dd {
	display: inline-block;
	margin: 0;
}

.assessment p,
.comments p {
	line-height: 1.4 !important;
}

.prompts {
	border-collapse: collapse;
	margin-bottom: 1em;
	width: 100%;
	page-break-before: avoid;
}

.prompt {
	text-align: left;
}

.prompt {
	width: 80%;
}

.grade {
	text-align: right;
}

.prompts th,
.prompts td {
	padding: .5em 0;
}

.prompts td {
	border-top: 1px dotted #999;
}

article, section {
	display: block;
	margin-bottom: 1em;
}
.narrative {
	border-bottom: 1px dotted #999;
}
/*
.standard-worksheet {
	page-break-inside: avoid;
}
*/
.narrative h2,
.standard-worksheet h2 {
	page-break-after: avoid;
}
dl {
	page-break-before: avoid;
	page-break-after: avoid;
	page-break-inside: avoid;
}
.grade {
	white-space: nowrap;
}

.empty-report {
    text-align: center;
    font-style: italic;
}
</style>
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
	{$quarter = $Grade->Term->Handle|substr:-2} {* Extract quarter from end of term handle *}

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
			{if $Grade->Student->Advisor}
				<div class="advisor">
					Advisor: {$Grade->Student->Advisor->FullName}
					<a href="mailto:{$Grade->Student->Advisor->Email}">{$Grade->Student->Advisor->Email}</a>
				</div>
			{/if}
			<h1>
				<span class="pretitle">Standards-Based Report Card for</span>
				{$Grade->Student->FullName}
			</h1>
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
				<dt class="instructor">Instructor</dt>
				<dd class="instructor">
					{$Grade->Section->Instructors[0]->FullName}
					{if $Grade->Section->Instructors[0]->Email}
						<a href="mailto:{$Grade->Section->Instructors[0]->Email}">&lt;{$Grade->Section->Instructors[0]->Email}&gt;</a>
					{/if}
				</dd>
			{/if}
		
			{if $Grade->WorksheetAssignment->Description}
				<dt class="description">Notes on Assessment</dt>
				<dd class="description">{$Grade->WorksheetAssignment->Description|escape|nl2br}</dd>
			{/if}
			</dl>
			<table class="prompts">
				<thead>
					<tr>
						<th class="prompt">Standard</th>
						{if $quarter == Q4}
							<th class="grade end">Year End</th>
						{else}
							<th class="grade mid">Mid-Year</th>
						{/if}
						
					</tr>
				</thead>
				<tbody>
		{/if}
		
		<tr>
			<td class="prompt">{$Grade->Prompt->Prompt|escape}</td>
			<td class="grade {tif $quarter == Q4 ? end : mid}">{if $Grade->Grade != "N/A"}{$gradeLabels[$Grade->Grade]}{else}{$Grade->Grade}{/if}</td>
		</tr>
				
		{if $lastGrade->Section->ID != $Grade->Section->ID}
		{/if}
		
	
	{$lastGrade = $Grade}
{foreachelse}
	<p class="empty-report">No reports matching your criteria are available</p>
{/foreach}

{if count($data)}
		</tbody>
	</table>
	</article>
{/if}
</section>

</body>
</html>