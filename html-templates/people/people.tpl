{extends "designs/site.tpl"}

{block content}

	<h1>People Directory</h1>
	
	<form>
		<input type="search" name="q" placeholder="Search People" value="{refill field=q}">
		<input type="submit" value="Go">
		{if $query}<input type="button" value="Clear Search" onclick="window.location='/people';">{/if}
	</form>
	
	{if $query}
		<h2>Search results for <quo>{$query|escape}</quo></h2>
	{/if}
	
	<ul>
	{foreach item=Person from=$data}
		<li>{personLink $Person summary=true}</li>
	{foreachelse}
		<li><em>No one's here yet =[</em></li>
	{/foreach}
	</ul>

{/block}