<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">

{* this template is copied from dev-progress.node0 *}

	<title>{block title}Report{/block}</title>
	<style>
		{file_get_contents(Site::resolvePath('site-root/css/reports/print.css')->RealPath)}
	</style>
</head>

{load_templates 'designs/print.subtemplates.tpl'}

<body class="{$responseId}">
{block "body"}
	<details><summary>Dump</summary>{dump $Record}</details>
	<h1 class="doc-title">{$responseId}</h1>
{*	<h1 class="doc-title">Student Record</h1>
	{$lastRecordType = false}
	
	{foreach item=Record from=$data}
		{if $lastRecordType != $Record.Class}

			{if $lastRecord}</section>{/if}

			<section class="doc-group">
				<h2 class="group-title">{$Record.Class}</h2>
		{/if}
		
		{if $Record.Class == 'Standards'}{standards $Record}{/if}
		
		{$lastRecordType = $Record.Class}

		<details><summary>Dump</summary>{dump $Record}</details>
	{/foreach}

	{if $lastRecordType}</section>{/if}*}
{/block}
</body>
</html>