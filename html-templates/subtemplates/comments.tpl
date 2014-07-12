{load_templates "subtemplates/contextLinks.tpl"}
{load_templates "subtemplates/people.tpl"}
{load_templates "subtemplates/forms.tpl"}

{template commentForm Context url=no Comment=no}
    {if $.Session->Person}
        {if $Comment}
            {$url = cat($Comment->getURL() '/edit')}
        {elseif !$url}
            {$url = cat($Context->getURL() '/comment')}
        {/if}

        <form class="comment-form" action="{$url|escape}" method="POST">
            <fieldset class="comment stretch">
                <div class="author">{avatar $.User size=56}</div>

                <div class="message">
                    {textarea Message $.User->FullName $validationErrors.Message hint='You can use <a href="http://daringfireball.net/projects/markdown/basics" target="_blank">Markdown</a> for formatting.' required=true default=$Comment->Message}

                    <div class="submit-area">
                        <input type="submit" class="submit" value="{tif $Comment ? Edit : Post} Comment">
                    </div>
                </div>
            </fieldset>
        </form>
    {else}
        <p class="login-hint well"><a href="/login?return={$Context->getURL()|escape:url}">Log in</a> to post a comment.</p>
    {/if}
{/template}

{template commentsList comments contextLinks=off}
    <section class="comments-list">
    {foreach item=Comment from=$comments}
        <article class="comment" id="comment-{$Comment->ID}">
            <div class="author">
                <a href="{$Comment->Creator->getURL()}">{avatar $Comment->Creator size=56}</a>
            </div>
            <div class="message">
                <header>
                    {personLink $Comment->Creator}
                </header>
                <div class="message-body">{$Comment->Message|markdown}</div>
                <footer>
                    <time><a href="#comment-{$Comment->ID}">{$Comment->Created|date_format:'%a, %b %e, %Y &middot; %-l:%M %P'}</a></time>
                    {if Emergence\Comments\CommentsRequestHandler::checkWriteAccess($Comment)}
                        {if $.User->hasAccountLevel(Staff)}<a href="{$Comment->getURL()}/edit" class="button tiny edit">Edit</a>{/if}
                        <a href="{$Comment->getURL()}/delete"
                           class="button destructive tiny confirm"
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
            <h4 class="header-title">Comments {if $Item->Comments}({count($Item->Comments)}){/if}</h4>
        </header>
        {commentsList $Item->Comments}
        {commentForm $Item}
    </section>
{/template}