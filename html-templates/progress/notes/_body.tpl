<header class="doc-header">
    {block header}
        <h{$headingLevel} class="item-title">{$Report->Subject|escape}</h{$headingLevel}>

        <div class="meta">
            {block meta}
                {$author = $Report->getAuthor()}
                <span class="item-creator">
                    {$author->FullName|escape}
                    {if $author->Email}&lt;<a class="url" href="mailto:{$author->Email|escape}">{$author->Email|escape}</a>&gt;{/if}
                </span>
                <time class="item-datetime">{$Report->getTimestamp()|date_format:'%b %e, %Y'}</time>
            {/block}
        </div>
    {/block}
</header>

<div class="item-body html-content">
    {block message}
        {$Report->Message}
    {/block}
</div>