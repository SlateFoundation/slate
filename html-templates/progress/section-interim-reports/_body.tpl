<header class="doc-header">
    <h{$headingLevel} class="item-title">
        {$Report->Section->Title|escape}
    </h{$headingLevel}>

    {*
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
    *}
</header>

<dl class="item-body">
    {if count($Report->Section->Teachers)}
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

    {if $Report->Grade}
        <div class="dli">
            <dt class="grade">Current Grade</dt>
            <dd class="grade">{$Report->Grade}</dd>
        </div>
    {/if}

    {if $Report->SectionTermData && trim($Report->SectionTermData->InterimReportNotes)}
        <div class="dli">
            <dt class="comments">Section Notes</dt>
            <dd class="comments">{$Report->SectionTermData->InterimReportNotes|escape|markdown}</dd>
        </div>
    {/if}

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
</dl>