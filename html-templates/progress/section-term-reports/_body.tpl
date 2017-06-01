<header class="doc-header">
    {block header}
        <h{$headingLevel} class="item-title">{block title}{$Report->Section->Title|escape}{/block}</h{$headingLevel}>

        {block meta}
            {if count($Report->Section->Teachers)}
                <dl class="meta">
                    <dt class="instructor">Teacher{tif count($Report->Section->Teachers) != 1 ? s}</dt>
                    {foreach item=Teacher from=$Report->Section->Teachers implode='<br />'}
                        <dd class="instructor">
                            {$Teacher->FullName|escape}
                            &lt;<a href="mailto:{$Teacher->Email|escape}">{$Teacher->Email|escape}</a>&gt;
                        </dd>
                    {/foreach}
                </dl>
            {/if}
        {/block}
    {/block}
</header>

<dl class="item-body">
    {*
    {if count($Report->Section->Teachers)}
        <dt class="instructor">Teacher{tif count($Report->Section->Teachers) != 1 ? s}</dt>
        {foreach item=Teacher from=$Report->Section->Teachers implode='<br />'}
            <dd class="instructor">
                {$Teacher->FullName|escape}
                &lt;<a href="mailto:{$Teacher->Email|escape}">{$Teacher->Email|escape}</a>&gt;
            </dd>
        {/foreach}
    {/if}
    *}

    {block items-top}
        {if $Report->Grade}
            <dt class="grade">Overall - Grade</dt>
            <dd class="grade">{$Report->Grade}</dd>
        {/if}
    {/block}

    {block section-notes}
        {if $Report->SectionTermData && trim($Report->SectionTermData->TermReportNotes)}
            <dt class="comments">Section Notes</dt>
            <dd class="comments">{$Report->SectionTermData->TermReportNotes|escape|markdown}</dd>
        {/if}
    {/block}

    {block comments}
        {if $Report->Notes}
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
        {/if}
    {/block}
</dl>