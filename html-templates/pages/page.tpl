{extends "designs/site.tpl"}

{block title}{$data->Title|escape} &mdash; {$dwoo.parent}{/block}

{block content}

	{$Page = $data}

	<header class="post-header">
		<h1 class="post-title">
			<a href="/pages/{$Page->Handle}">{$Page->Title}</a>
			{if Emergence\CMS\PagesRequestHandler::checkWriteAccess($Page, true)}
				<a href="/pages/{$Page->Handle}/edit" class="edit-link button primary small">Edit</a>
			{/if}
		</h1>
	
		{* Commented-out until author is editable and last update is tracked 
		<div class="post-info">
			<span class="author">Published {if $.User}by <a href="/users/{$Page->Author->Handle}">{$Page->Author->FullName}</a>{/if}</span>
			{ *<span class="tags">in {foreach item=Tag from=$Page->Tags implode=', '}<a href="/tags/{$Tag->Handle}">{$Tag->Title|escape}</a>{/foreach}</span>* }
			<span class="timestamp">on <time pubdate datetime="{$Page->Published|date_format:'%FT%T%z'}">{$Page->Published|date_format:"%A, %B %e, %Y at %l:%M %P"}</time></span>
		</div>
		*}
	</header>
	<section class="post-body">
		{$Page->renderBody()}
	</section>

{/block}