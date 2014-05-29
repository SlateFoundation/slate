{extends designs/site.tpl}

{block "content"}
    {load_templates "subtemplates/paging.tpl"}
    
    <header class="page-header">
        <h2 class="header-title">Blog Feed</h2>
        <div class="header-buttons">
            <a href="/blog/create" class="button primary">Create a Post</a>
        </div>            
    </header>
    
    {foreach item=BlogPost from=$data}
        {blogPost $BlogPost headingLevel=h3}
    {foreachelse}
        <p>Stay tuned for the first post</p>
    {/foreach}

    {if $total > $limit}
    <footer class="page-footer">
        <strong>{$total|number_format} posts:</strong> {pagingLinks $total pageSize=$limit}
    </footer>
    {/if}
{/block}