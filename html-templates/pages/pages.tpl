{extends "designs/site.tpl"}

{block title}Pages Directory &mdash; {$dwoo.parent}{/block}

{block content}
<div class="sidebar-layout">
	<div class="main-col">
		<div class="col-inner">
			<header class="page-header">
				<h1 class="header-title title-1">Pages Directory</h1>
			</header>
		
		    <ul class="pages-list">
		    {foreach item=Page from=$data}
		        <li class="pages-list-item"><a href="/pages/{$Page->Handle}">{$Page->Title|escape}</a></li>
		    {/foreach}
		    </ul>
		</div>
	</div>

	<div class="sidebar-col">
	    <form action="/pages/create" method="GET" class="col-inner">
	        <fieldset class="stretch">
				{field "Title" "Page Title"}
	            <input type="submit" value="Create New Page">
	        </fieldset>
	    </form>
	</div>
{/block}