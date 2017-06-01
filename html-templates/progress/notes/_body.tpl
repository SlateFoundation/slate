<header class="doc-header">
    <h{$headingLevel} class="item-title">{$Report->Subject|escape}</h{$headingLevel}>

    <div class="meta">
        {$author = $Report->getAuthor()}
        <span class="item-creator">
            {$author->FullName|escape}
            {if $author->Email}&lt;<a class="url" href="mailto:{$author->Email|escape}">{$author->Email|escape}</a>&gt;{/if}
        </span>
        <time class="item-datetime">{$Report->getTimestamp()|date_format:'%b %e, %Y'}</time>
    </div>
</header>

<div class="item-body">{$Report->Message}</div>