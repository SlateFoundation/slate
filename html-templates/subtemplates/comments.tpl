{load_templates "subtemplates/contextLinks.tpl"}
{load_templates "subtemplates/people.tpl"}

{template commentForm Context url=no}
    {if $.Session->Person}
        <form class="comment-form" action="{tif $url ? $url : cat($Context->getURL() '/comment')}" method="POST">
            <fieldset class="comment stretch">
                <div class="author">{avatar $.User size=56}</div>

                <div class="message">
                    <label class="field">
                        <span>{$.User->FullName}</span>
                        <textarea id="Message" name="Message"></textarea>
                    </label>

                    <p class="hint">You can use <a href="http://daringfireball.net/projects/markdown/basics">Markdown</a> for formatting.</p>

                    <input type="submit" class="submit" value="Post Comment">
                </div>
            </fieldset>
        </form>
    {else}
        <p class="login-hint"><a href="/login?return={$Context->getURL()|escape:url}">Log in</a> to post a comment.</p>
    {/if}
{/template}

{template commentsList comments contextLinks=off}
    <section class="comments-list">
    {foreach item=Comment from=$comments}
        <article class="comment" id="comment-{$Comment->ID}">
            <div class="author">
                <a href="/people/{$Comment->Creator->Username}">{avatar $Comment->Creator size=56}</a>
            </div>
            <div class="message">
                <header>
                    {personLink $Comment->Creator}
                </header>
                <div class="message-body">{$Comment->Message|markdown}</div>
                <footer>
                    <time>{$Comment->Created|date_format:'%c'}</time>
                    {if $Comment->userCanWrite}
                        {*<a href="/comments/{$Comment->ID}/edit" class="edit">Edit</a>*}
                        <a href="/comments/{$Comment->ID}/delete"
                           class="button destructive small confirm"
                           data-confirm-yes="Delete Comment"
                           data-confirm-no="Don&rsquo;t Delete"
                           data-confirm-title="Deleting Comment"
                           data-confirm-body="Are you sure you want to delete this comment from {$Comment->Creator->FullName|escape}?"
                           data-confirm-destructive="true"
                           data-confirm-url="/comments/json/{$Comment->ID}/delete">Delete</a>
                    {/if}
                </footer>
            </div>
        </article>
    {foreachelse}
        <p class="empty-text">No comments have been posted yet.</p>
    {/foreach}
    </section>
{/template}

{*
{template commentForm Context url=no}
    {if $.Session->Person}
    <form class="comment-form" action="{tif $url ? $url : cat($Context->getURL() '/comment')}" method="POST">
        <div class="field expand">
            <label for="Message">Message</label>
            <input type="hidden" value="{$Context->ID}" name="BlogPostID">
            <textarea name="Message"></textarea>
        </div>

        <div class="submit">
            <input type="submit" class="submit" value="Post Comment">
        </div>

    </form>
    {else}
        Must login to comment
    {/if}
{/template}

{template commentsList comments contextLinks=off tools=on}
    <ol class="comments-list" id="comments">
    {foreach item=Comment from=$comments}
        <li class="comment" id="comment-{$Comment->ID}">
            {if $Comment->Author->Class != Person  && $Comment->Author->Class != Disabled}
                <address>{personLink $Comment->Creator yes 60 60}</address>
            {/if}

            {if $Comment->Author->Class == Person}
                <address><img src="/thumbnail/person/60x60" /><a href="/users/:{$Comment->Author->ID}">{$Comment->Author->FullName}</a></address>
            {/if}

            <div class="message">
                {if $Comment->ReplyTo}
                    {if $Comment->ReplyTo->Author->Class == Person}
                        <a class="receiver" href="#comment-{$Comment->ReplyTo->ID}">@{$Comment->ReplyTo->Author->FullName}</a>
                    {else}
                        <a class="receiver" href="#comment-{$Comment->ReplyTo->ID}">@{$Comment->ReplyTo->Author->Username}</a>
                    {/if}
                {/if}
                {$Comment->Message}
            </div>
            {if $contextLinks}<div class="context">in reply to {contextLink $Comment->Context}</div>{/if}
            <hr/>
            <div class="footer">
                <time datetime="{$Comment->Created|date_format:'%Y-%m-%dT%H:%M:%S%z'}" pubdate>
                    {$Comment->Created|fuzzy_time}
                </time>
                {if $tools}
                <div class="tools">
                    <a href="#reply-{$Comment->ID}" class="replyLink">Reply</a>
                    {if $Comment->userCanWrite}
                        <a href="/comments/{$Comment->ID}/edit" class="edit">Edit</a>
                        <a href="/comments/{$Comment->ID}/delete" class="delete">Delete</a>
                    {/if}
                </div>
                {/if}
            </div>
        </li>
    {foreachelse}
        <div class="nocomments">No comments have been posted yet.</div>
    {/foreach}
    </ol>
{/template}
*}