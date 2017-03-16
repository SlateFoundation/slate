<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{block title}Progress Report{tif count($data) > 1 ? 's'}{/block}</title>
    <style type="text/css">
        {foreach from=$recordTypes item=recordType}
            <?php 
                $recordClass = $this->scope['recordType'];
                $this->scope['recordTypeCSS'] = $recordClass::getCSS();
            ?>
            {$recordTypeCSS}
        {/foreach}
    </style>
</head>

<body class="{$.responseId}">

{block 'body'}    
    {if count($data)}
    	{*<h1 class="doc-title">{$data[0]->getStudent()->FullNamePossessive} Reports</h1>*}
    	{$lastRecordType = false}
    
    	{foreach item=Record from=$data}

			{if $lastRecord}
                </section>
            {/if}

			<section class="doc-group">
				<div class="group-title">
                    {$Record->getHeaderHTML()}
                </div>

            {$Record->getBodyHTML()}

            {$lastRecord = $Record}
    
    	{/foreach}    
    	</section>
    {else}
        <span class="empty">There were no records that fit the criteria&hellip;</span>
    {/if}
{/block}

</body>

</html>