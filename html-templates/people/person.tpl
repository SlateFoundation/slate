{extends designs/site.tpl}

{block "title"}{$data->FullName} &mdash; {$dwoo.parent}{/block}

{block "content"}
    {$Person = $data}
	<header>
	    <hgroup>
        	<h1>{$Person->FullName|escape}</h1>
            {if $.User->ID == $Person->ID}
        	    <div class="mini-page-tools"><a href="/blog/create" class="button primary">Create a Post</a></div>
            {/if}
        	<h2>Blog Feed</h2>
	    </hgroup>
	</header>

	{foreach item=BlogPost from=Emergence\CMS\BlogPost::getAllPublishedByAuthor($Person)}
		{blogPost $BlogPost}
	{foreachelse}
		<p class="empty-text">This person hasn’t posted anything to their public blog yet.</p>
	{/foreach}

	<footer class="page-footer">
		<a href="/blog/rss?AuthorID={$Person->ID}"><img src="/img/rss.png" width=14 height=14 alt="RSS"></a>
	</footer>
{/block}

{block "skip-link"}Skip to Profile Info{/block}

{block "sidebar"}
	{$Person = $data}

	{if $Person->PrimaryPhoto}
	<div class="sidebar-item">
		<a href="{$Person->PrimaryPhoto->WebPath}" class="display-photo-link"><img class="display-photo" src="{$Person->PrimaryPhoto->getThumbnailRequest(646,646)}" alt="Profile Photo: {$Person->FullName|escape}" style="max-width:100%;height:auto" width=323 height=323 /></a>
	</div>
	{/if}

	<div class="sidebar-item">
	{if $Person->Biography}
		<h3>Bio</h3>
		<div class="well">{$Person->Biography}</div>
	{elseif $Person->About}
		<h3>About Me</h3>
		<div class="well">{$Person->About}</div>
	{/if}
	</div>
	
	{if $.Session->hasAccountLevel('Staff')}
	<div class="sidebar-item">
		<h3>Contact Info <small class="muted">(Staff-Only)</small></h3>
		<dl class="well property-list block profile-contact-info">
			{if $Person->Email}
			    <div class="dli">
    				<dt>Email</dt>
    				<dd><a href="mailto:{$Person->Email}" title="Email {$Person->FullName|escape}">{$Person->Email}</a></dd>
			    </div>
			{/if}
			
			{if $Person->Phone}
			    <div class="dli">
    				<dt>Phone</dt>
    				<!-- tel: URL scheme fails in desktop browsers -->
    				<dd><!-- <a href="tel:{$Person->Phone}"> -->{$Person->Phone|phone}<!-- </a> --></dd>
			    </div>
			{/if}		
		</dl>
	</div>
	{/if}
{/block}