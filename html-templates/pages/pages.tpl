{extends "designs/site.tpl"}

{block title}Pages Directory &mdash; {$dwoo.parent}{/block}

{block content}
	
	<h1>Pages Directory</h1>

	<form action="/pages/create" method="GET">
		<fieldset class="page-tools">
			<input type="text" name="Title" value="{$pageHandle|replace:'_':' '|ucwords|escape}" placeholder="Page Title">
			<input type="submit" value="Create New Page">
		</fieldset>
	</form>

	<ul class="pages-list">	
	{foreach item=Page from=$data}
		<li class="pages-list-item"><a href="/pages/{$Page->Handle}">{$Page->Title|escape}</a></li>
	{/foreach}
	</ul>
	
{/block}