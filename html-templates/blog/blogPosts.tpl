{extends designs/site.tpl}

{block "content"}
	<div class="mini-page-tools"><a href="/blog/create" class="button primary">Create a Post</a></div>
	<h1>Blog Feed</h1>

	{foreach item=BlogPost from=$data}
		{blogPost $BlogPost}
	{foreachelse}
		<p>Stay tuned for the first post</p>
	{/foreach}

	{if $total > $limit}
	<footer class="page-footer">
		<strong>{$total|number_format} posts:</strong> {pagingLinks $total pageSize=$limit}
	</footer>
	{/if}
{/block}