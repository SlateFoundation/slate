{load_templates "subtemplates/people.tpl"}
{load_templates "subtemplates/comments.tpl"}

{template blogPost Post showHeader=true showBody=true showFooter=true showComments=false showCommentsSummary=true headingLevel=h2}
    <article class="blog-post">
        {if $showHeader}
            <header class="section-header">
                <{$headingLevel} class="header-title">
                    <a href="/blog/{$Post->Handle}">{$Post->Title|escape}</a>
                </{$headingLevel}>

                {if Emergence\CMS\BlogRequestHandler::checkWriteAccess($Post)}
                <div class="header-buttons">
                    <a href="/blog/{$Post->Handle}/edit" class="button small">Edit</a>&nbsp;
                    <a href="/blog/{$Post->Handle}/delete"
                       class="button destructive confirm small"
                       data-confirm-yes="Delete Post"
                       data-confirm-no="Don&rsquo;t Delete"
                       data-confirm-title="Deleting Post"
                       data-confirm-body="Are you sure you want to delete the post &ldquo;{$Post->Title|escape}?&rdquo;"
                       data-confirm-destructive="true"
                       data-confirm-url="/blog/json/{$Post->Handle}/delete">Delete</a>
                </div>
                {/if}
            </header>
        {/if}
        <div class="section-info">
            <span class="author">Posted by {personLink $Post->Author}</span>
            {if $Post->Context}
                in {contextLink $Post->Context}
            {/if}
            <span class="timestamp">on <time pubdate datetime="{$Post->Published|date_format:'%FT%T%z'}">{$Post->Published|date_format:"%A, %B %e, %Y at %l:%M %P"}</time></span>
        </div>

        {if $showBody}
            <section class="section-body">
                {$Post->renderBody()}
            </section>
        {/if}

        {if $showFooter}
            <footer class="section-footer">
                {if $Post->Tags}
                    <div class="post-tags">
                        Tags: {foreach item=Tag from=$Post->Tags implode=', '}<a href="/tags/{$Tag->Handle}">{$Tag->Title|escape}</a>{/foreach}</span>
                    </div>
                {/if}

                {if $showComments}
                    <section class="comments">
                        <a name="comments"></a>
                        <h3>Comments</h3>
                        {commentForm $Post}
                        {commentsList $Post->Comments}
                    </section>
                {elseif $showCommentsSummary}
                    <a href="/blog/{$Post->Handle}#comments">
                        {if $Post->Comments}
                            {count($Post->Comments)} Comment{tif count($Post->Comments) != 1 ? s}
                        {else}
                            Be the first to comment.
                        {/if}
                    </a>
                {/if}
            </footer>
        {/if}
    </article>
{/template}