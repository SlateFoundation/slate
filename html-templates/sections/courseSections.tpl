{extends "designs/site.tpl"}


{block "content"}

	<h1>Course Section Directory</h1>
	<ul>
	{foreach item=Section from=$data}
		<li><a href="/sections/{$Section->Handle}">{$Section->Title|escape}</a></li>
	{/foreach}
	</ul>
{/block}

