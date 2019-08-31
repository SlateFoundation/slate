{extends "designs/site.tpl"}


{block "content"}
<div id="app-body">

	{$User = $data}
	
	<h1>{$.server.HTTP_HOST} account created</h1>
	<hr class="clear" />
	
	<p>Your username is: <a href="/people/{$User->Username}">{$User->Username|escape}</a></p>
	
	<p>
		Things to do next&hellip;
		<ul>
			{if $.request.return}
			<li><a href="{$.request.return|escape}">Continue back to {$.request.return|escape}</a></li>
			{/if}
			<li><a href="/profile">Fill out your profile and upload a photo</a></li>
		</ul>
	</p>
</div>	
{/block}
