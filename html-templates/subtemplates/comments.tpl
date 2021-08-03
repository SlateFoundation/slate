{load_templates "subtemplates/contextLinks.tpl"}
{load_templates "subtemplates/people.tpl"}
{load_templates "subtemplates/personName.tpl"}
{load_templates "subtemplates/forms.tpl"}

{template commentForm Context url=no Comment=no}
    {if $.User}
        {if $Comment}
            {$author = $Comment->Creator}
            {$url = cat($Comment->getURL() '/edit')}
        {elseif !$url}
            {$author = $.User}
            {$url = cat($Context->getURL() '/comment')}
        {/if}

        <form class="comment-form" action="{$url|escape}" method="POST">
            <fieldset class="comment stretch">
                <div class="author">{avatar $author size=56}</div>

                <div class="message">
                    {capture assign=authorName}{personName $author}{/capture}
                    {textarea Message $authorName $validationErrors.Message hint='You can use <a href="https://www.markdownguide.org/cheat-sheet" target="_blank">Markdown</a> for formatting.' required=true default=$Comment->Message}

                    <div class="submit-area">
                        <input type="submit" class="submit" value="{tif $Comment ? Edit : Post} Comment">
                    </div>
                </div>
            </fieldset>
        </form>
    {else}
        <p class="login-hint well"><a class="button primary" href="/login?return={$Context->getURL()|escape:url}">Log in</a> to post a comment.</p>
    {/if}
{/template}

{template commentsList comments contextLinks=off}
    <section class="comments-list">
    {foreach item=Comment from=$comments}
        <article class="comment" id="comment-{$Comment->ID}">
            {if $Comment->Creator}
                <div class="author">
                    <a href="{$Comment->Creator->getURL()}">{avatar $Comment->Creator size=56}</a>
                </div>
            {/if}
            <div class="message">
                <header>
                    {personLink $Comment->Creator}
                </header>
                <div class="message-body">{$Comment->Message|escape|markdown}</div>
                <footer>
                    <time><a href="#comment-{$Comment->ID}">{$Comment->Created|date_format:'%a, %b %e, %Y &middot; %-l:%M %P'}</a></time>
                    {if Emergence\Comments\CommentsRequestHandler::checkWriteAccess($Comment, true)}
                        {if $.User->hasAccountLevel(Staff)}<a href="{$Comment->getURL()}/edit" class="edit">Edit</a>{/if}
                        <a href="{$Comment->getURL()}/delete"
                           class="confirm"
                           data-confirm-yes="Delete Comment"
                           data-confirm-no="Don&rsquo;t Delete"
                           data-confirm-title="Deleting Comment"
                           data-confirm-body="Are you sure you want to delete this comment from {$Comment->Creator->FullName|escape}?"
                           data-confirm-destructive="true"
                           data-confirm-success-target=".comment"
                           data-confirm-success-message="Comment deleted">Delete</a>
                    {/if}
                </footer>
            </div>
        </article>
    {foreachelse}
        <p class="empty-text section-info">No comments have been posted yet.</p>
    {/foreach}
    </section>
{/template}

{template commentSection Item}
    <section class="comments reading-width" id="comments">
        <header class="section-header">
            <h2 class="header-title title-3">Comments {if $Item->Comments}({count($Item->Comments)}){/if}</h2>
        </header>
        {commentsList $Item->Comments}
        {commentForm $Item}
    </section>
{/template}