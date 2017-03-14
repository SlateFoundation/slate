<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{block title}Report{/block}</title>
    <style type="text/css">
        {$includedStylesheets = array()}
        {foreach from=$recordTypes item=recordType}

            {if !in_array($recordType.stylesheet, $includedStylesheets)}
                <?php $this->scope['includedStylesheets'][] = $this->scope['recordType']['stylesheet']; ?>
                {file_get_contents($recordType.stylesheet)}
            {/if}
        {/foreach}
    </style>
</head>

<body class="{$.responseId}">

{block 'body'}    
    {if count($data)}
    	{*<div class="doc-title">{$data[0]->getReportHeader()}</div>*}
    	{$lastRecordType = false}
    
    	{foreach item=Record from=$data}
            {*dump $Record*}
    		{*if $lastRecordType != $Record->getType()*}

			{if $lastRecord}
            </section>
            {/if}

			<section class="doc-group">
				<div class="group-title">
                    {if $lastRecord->StudentID != $Record->StudentID || $lastRecord->getType() != $Record->getType()}{$Record->getReportHeader()}{else}<header>{$Record->getRecordHeader()}</header>{/if}</div>

            {$lastRecord = $Record}

            {$Record->getBody()}
    
    	{/foreach}
    
    	</section>

    {else}
        <span class="empty">There were no records that fit the criteria&hellip;</span>
    {/if}
{/block}

</body>

</html>