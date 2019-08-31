{extends "designs/site.tpl"}

{block "title"}Password Changed &mdash; {$dwoo.parent}{/block}

{block "content"}
    <header class="page-header">
        <h1 class="header-title title-1">Password Changed</h1>
	</header>

	<p class="lead">Your new password has been saved.</p>
	
	<a href="/login" class="button primary">Login now</a>
{/block}