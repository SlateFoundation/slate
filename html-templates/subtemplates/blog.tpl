{load_templates "subtemplates/people.tpl"}
{load_templates "subtemplates/comments.tpl"}

{** A parallel new version ryon did at some points -- merge into lower def and delete this
{template blogPost}
    <article class="blog-post">
        <header>
            <h1 class="post-title"><a href="/blog/this-is-the-title">This is the title of a blog post</a></h1>
            <div class="meta-info">
                <span class="author">Posted by <a href="#">Just Some Guy</a></span>
                <span class="category">in <a href="#">Some Category</a></span>
                <span class="timestamp">on <time pubdate>Tuesday, October 9, 2012 at 9:17pm</time></span>
            </div>
        </header>
        <section>
            {for i 0 mt_rand(0,5)}
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam sodales urna non odio egestas tempor. Nunc vel vehicula ante. Etiam bibendum iaculis libero, eget molestie nisl pharetra in. In semper consequat est, eu porta velit mollis nec. Curabitur posuere enim eget turpis feugiat tempor. Etiam ullamcorper lorem dapibus velit suscipit ultrices. Proin in est sed erat facilisis pharetra.</p>
            {/for}
        </section>
        <footer>
            <div class="comments-ct">
                <ul class="comments">
                    {$lipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce posuere rhoncus nunc, ut faucibus neque mollis eget. Pellentesque elementum nunc enim, eget sodales justo. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris ornare leo id enim commodo sed iaculis mauris pretium. Pellentesque sapien erat, bibendum at consectetur non, tincidunt quis diam. Phasellus vitae dolor vitae ligula rutrum suscipit quis eu ante. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin quis eros orci. Suspendisse euismod magna ac purus ultricies sit amet ultricies quam ultrices. Sed porta urna eget justo feugiat venenatis. Morbi id magna eget tellus ornare porta. Sed sit amet convallis augue. Nunc malesuada pretium justo, vitae vehicula leo ullamcorper id."}
                    {for i 0 mt_rand(0,mt_rand(0,10))}
                        <li class="comment">
                            <div class="meta-info">
                                <span class="author"><a href="#">Some Other Guy</a></span>&nbsp;&middot;
                                <span class="timestamp"><time>Oct 9, 2012&nbsp;&middot; 9:20pm</time></span>
                            </div>
                            <p>{truncate $lipsum mt_rand(30, strlen($lipsum)) ''}</p>
                        </li>
                    {/for}
                </ul>
            </div>
        </footer>
    </article>
{/template}
**}

{template blogPost Post showHeader=true showBody=true showFooter=true showComments=false showCommentsSummary=true headingLevel=h2}
    <article class="blog-post">
        {if $showHeader}
            <header class="post-header">
                {if Emergence\CMS\BlogRequestHandler::checkWriteAccess($Post)}
                    <div class="post-actions">
                        <a href="/blog/{$Post->Handle}/edit" class="button small">Edit</a>
                        <a href="/blog/{$Post->Handle}/delete"
                           class="button destructive small confirm"
                           data-confirm-yes="Delete Post"
                           data-confirm-no="Don&rsquo;t Delete"
                           data-confirm-title="Deleting Post"
                           data-confirm-body="Are you sure you want to delete the post &ldquo;{$Post->Title|escape}?&rdquo;"
                           data-confirm-destructive="true"
                           data-confirm-url="/blog/json/{$Post->Handle}/delete">Delete</a>
                    </div>
                {/if}
                <{$headingLevel} class="post-title">
                    <a href="/blog/{$Post->Handle}">{$Post->Title|escape}</a>
                </{$headingLevel}>
                <div class="post-info">
                    <span class="author">Posted by {personLink $Post->Author}</span>
                    {if $Post->Context}
                        in {contextLink $Post->Context}
                    {/if}
                    <span class="timestamp">on <time pubdate datetime="{$Post->Published|date_format:'%FT%T%z'}">{$Post->Published|date_format:"%A, %B %e, %Y at %l:%M %P"}</time></span>
                </div>
            </header>
        {/if}

        {if $showBody}
            <section class="post-body">
                {$Post->renderBody()}
            </section>
        {/if}

        {if $showFooter && $Post->Tags}
            <footer class="post-footer">
                <div class="post-info">
                    Tags: {foreach item=Tag from=$Post->Tags implode=', '}<a href="/tags/{$Tag->Handle}">{$Tag->Title|escape}</a>{/foreach}</span>
                </div>
            </footer>
        {/if}

        {if $showComments}
            <aside class="comments">
                <a name="comments"></a>
                <h3>Comments</h3>
                {commentForm $Post}
                {commentsList $Post->Comments}
            </aside>
        {elseif $showCommentsSummary}
            <a href="/blog/{$Post->Handle}#comments">
                {if $Post->Comments}
                    {count($Post->Comments)} Comment{tif count($Post->Comments) != 1 ? s}
                {else}
                    Be the first to comment
                {/if}
            </a>
        {/if}
    </article>
{/template}