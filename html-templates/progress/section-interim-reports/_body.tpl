<header class="doc-header">
    {block header}
        <h{$headingLevel} class="item-title">{block title}{$Report->Section->Title|escape}{/block}</h{$headingLevel}>

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

<dl class="item-body">
    {block teachers}
        {if count($Report->Section->Teachers) && !(count($Report->Section->Teachers) == 1 && $Report->Section->Teachers[0]->ID == $Report->getAuthor()->ID)}
            <div class="dli">
                <dt class="instructor">Teacher{tif count($Report->Section->Teachers) != 1 ? s}</dt>
                {foreach item=Teacher from=$Report->Section->Teachers implode='<br />'}
                    <dd class="instructor">
                        {$Teacher->FullName|escape}
                        &lt;<a href="mailto:{$Teacher->Email|escape}">{$Teacher->Email|escape}</a>&gt;
                    </dd>
                {/foreach}
            </div>
        {/if}
    {/block}

    {block fields}{/block}

    {block section-notes}
        {if $Report->SectionTermData && trim($Report->SectionTermData->InterimReportNotes)}
            <div class="dli">
                <dt class="comments">Section Notes</dt>
                <dd class="comments">{$Report->SectionTermData->InterimReportNotes|escape|markdown}</dd>
            </div>
        {/if}
    {/block}

    {block comments}
        {if $Report->Notes}
            <div class="dli">
                <dt class="comments">Comments</dt>
                <dd class="comments">
                    {if $Report->NotesFormat == 'html'}
                        {$Report->Notes}
                    {elseif $Report->NotesFormat == 'markdown'}
                        {$Report->Notes|escape|markdown}
                    {else}
                        {$Report->Notes|escape}
                    {/if}
                </dd>
            </div>
        {/if}
    {/block}
</dl>