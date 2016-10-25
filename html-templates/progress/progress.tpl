{extends 'designs/print.tpl'}

{block 'body'}
	<h1 class="doc-title">{$data[0]['StudentFullName']}</h1>
	{$lastRecordType = false}

    <?php

    $this->scope['recordClasses'] = array(
		'Standards' => 'Standards',
		'NarrativeReport' => 'Narrative Report',
		'InterimReport' => 'Interim Report',
		'Slate\\Progress\\Note' => 'Progress Note'
	);
	?>

	{foreach item=Record from=$data}
		{if $lastRecordType != $Record.Class}

			{if $lastRecord}</section>{/if}

			<section class="doc-group">
				<h2 class="group-title">{$recordClasses[$Record.Class]}</h2>
		{/if}

		{if $Record.Class == 'Standards'}{standards $Record}
		{elseif $Record.Class == 'NarrativeReport'}{narrative $Record}
		{elseif $Record.Class == 'InterimReport'}{interim $Record}
		{elseif $Record.Class == 'Slate\\Progress\\Note'}{progressnote $Record}
		{/if}

		{$lastRecordType = $Record.Class}

		{*<details><summary>Dump</summary>{dump $Record}</details>*}
	{/foreach}

	{if $lastRecordType}</section>{/if}
{/block}