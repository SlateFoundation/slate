{load_templates "subtemplates/people.tpl"}
{load_templates "subtemplates/comments.tpl"}
{load_templates "subtemplates/contextLinks.tpl"}

{template blogPost Post headingLevel=h1 showHeader=true showBody=true showFooter=true showComments=false showCommentsSummary=true showContext=true useSummary=false articleClass='' titlePrefix='' includeSummaryInBody=false}
    <article class="blog-post reading-width {$articleClass}">
        {if $showHeader}
            <header class="article-header">
                <{$headingLevel} class="header-title">
                    {$titlePrefix}
                    <a href="{$Post->getURL()}">{$Post->Title|escape}</a>
                </{$headingLevel}>

                {if Emergence\CMS\BlogRequestHandler::checkWriteAccess($Post, true)}
                <div class="header-buttons">
                    <a href="{$Post->getURL()}/edit" class="button small">Edit</a>&nbsp;
                    <a href="{$Post->getURL()}/delete"
                       class="button destructive confirm small"
                       data-confirm-yes="Delete Post"
                       data-confirm-no="Don&rsquo;t Delete"
                       data-confirm-title="Deleting Post"
                       data-confirm-body="Are you sure you want to delete the post &ldquo;{$Post->Title|escape}?&rdquo;"
                       data-confirm-destructive="true"
                       data-confirm-success-target=".blog-post"
                       data-confirm-success-message="Blog post deleted">Delete</a>
                </div>
                {/if}
            </header>
        {/if}
        <div class="section-info">
            <span class="author">Posted by {personLink $Post->Author}</span>
            {if $showContext && $Post->Context}
                in {contextLink $Post->Context}
            {/if}
            <span class="timestamp">on <time pubdate datetime="{$Post->Published|date_format:'%FT%T%z'}">{$Post->Published|date_format:"%A, %B %e, %Y at %l:%M %P"}</time></span>
        </div>

        {if $useSummary && $Post->Summary}
            <section class="section-body summary">
                <p>{$Post->Summary|escape|linkify}</p>
                <p><a href="{$Post->getURL()}">Read more&hellip;</a></p>
            </section>
        {elseif $showBody}
            {if $includeSummaryInBody}
                <section class="section-body summary">
                    <p>{$Post->Summary|escape|linkify}</p>
                </section>
            {/if}

            <section class="section-body">
                {$Post->renderBody()}
            </section>
        {/if}

        {if $showFooter}
            <footer class="section-footer">
                {if $Post->Tags}
                    <div class="post-tags">
                        Tags: {foreach item=Tag from=$Post->Tags implode=', '}<a href="{$Tag->getURL()}">{$Tag->Title|escape}</a>{/foreach}
                    </div>
                {/if}
                {if $showCommentsSummary}
                    <a href="{$Post->getUrl()}#comments">
                        {if $Post->Comments}
                            {count($Post->Comments)} Comment{tif count($Post->Comments) != 1 ? s}
                        {else}
                            Be the first to comment.
                        {/if}
                    </a>
                {/if}
            </footer>
        {/if}

        {if $showComments}
            {commentSection $Post}
        {/if}
    </article>
{/template}