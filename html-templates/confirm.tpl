{extends "designs/site.tpl"}

{block "content"}
    {if $data->getTitle()}<h1>Delete {$data->getTitle()}</h1>
	{else}<h1>Please confirm</h1>
    {/if}
	<p class="confirm">{$question}</p>
	<form method="POST">
    	<button type="button" name="Sure" value="No" onclick="javascript:history.go(-1);">No</button>
		<input class="destructive" type="submit" name="Sure" value="Yes">
	</form>
{/block}