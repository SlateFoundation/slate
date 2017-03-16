<article class="report">
    <h2>{$Report->Section->Title|escape}</h2>
    
    <dl>
        {if count($Report->Section->Teachers)}
            <dt class="instructor">Teacher{tif count($Report->Section->Teachers) != 1 ? s}</dt>
            {foreach item=Teacher from=$Report->Section->Teachers implode='<br />'}
                <dd class="instructor">
                    {$Teacher->FullName|escape}
                    &lt;<a href="mailto:{$Teacher->Email|escape}">{$Teacher->Email|escape}</a>&gt;
                </dd>
            {/foreach}
        {/if}
        {if $Report->Grade}
            <dt class="grade">Overall - Grade</dt>
            <dd class="grade">{$Report->Grade}</dd>
        {/if}
        {if $Report->SectionTermData && trim($Report->SectionTermData->TermReportNotes)}
            <dt class="comments">Section Notes</dt>
            <dd class="comments">{$Report->SectionTermData->TermReportNotes|escape|markdown}</dd>
        {/if}
    
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
    </dl>
</article>