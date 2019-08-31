{extends designs/site.tpl}

{block title}Browse Media &mdash; {$dwoo.parent}{/block}

{block content}
	<a class="button" href="/media/upload">Upload media</a>

	<ul>
		{foreach item=Media from=$data}
			<li><a href="/media/info/{$Media->ID}"><img src="/thumbnail/{$Media->ID}/200x200"></a></li>
		{/foreach}
	</ul>
{/block}