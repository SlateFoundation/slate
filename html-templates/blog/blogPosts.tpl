{extends designs/site.tpl}

{block "content"}
    {load_templates "subtemplates/blog.tpl"}
    {load_templates "subtemplates/paging.tpl"}
    
    <header class="page-header">
        <h1 class="header-title title-1">Blog Feed</h1>
        <div class="header-buttons">
            <a href="/blog/create" class="button primary">Create a Post</a>
        </div>            
    </header>
    
    <section class="page-section article-collection">
    {foreach item=BlogPost from=$data}
        {blogPost $BlogPost headingLevel=h2}
    {foreachelse}
        <p class="empty-text">Stay tuned for the first post&hellip;</p>
    {/foreach}
    </section>

    {if $total > $limit}
    <footer class="page-footer">
        <strong>{$total|number_format} posts:</strong> {pagingLinks $total pageSize=$limit}
    </footer>
    {/if}
{/block}