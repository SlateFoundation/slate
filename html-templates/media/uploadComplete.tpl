{extends designs/site.tpl}

{block title}Upload Media &mdash; {$dwoo.parent}{/block}

{block content}
	{$Media = $data}

	<p class="lead">Media #{$Media->ID} uploaded successfully</p>
	<h3>Original Media</h3>
	<p>
		View: <a href="/media/open/{$Media->ID}">http://{$.server.HTTP_HOST}/media/open/{$Media->ID}</a>
		<br>Download: <a href="/media/download/{$Media->ID}">http://{$.server.HTTP_HOST}/media/download/{$Media->ID}</a>
	</p>
	<h3>Thumbnails</h3>
	<p class="muted">Edit the last segment of the URL to retrieve any size</p>
	<p><img src="/thumbnail/{$Media->ID}/500x500"><br><a href="/thumbnail/{$Media->ID}/500x500">http://{$.server.HTTP_HOST}/thumbnail/{$Media->ID}/500x500</a></p>
	<p><img src="/thumbnail/{$Media->ID}/200x200"><br><a href="/thumbnail/{$Media->ID}/200x200">http://{$.server.HTTP_HOST}/thumbnail/{$Media->ID}/200x200</a></p>
	<p><img src="/thumbnail/{$Media->ID}/50x50"><br><a href="/thumbnail/{$Media->ID}/50x50">http://{$.server.HTTP_HOST}/thumbnail/{$Media->ID}/50x50</a></p>
{/block}