{$Section = $Report->Section}
{$Instructor = $Section->Instructors.0}

{block header}
    <h{$headingLevel} style="margin: 0 0 1em; color: #004b66;">{$Section->Title|escape}</h{$headingLevel}>
{/block}

{block teachers}
    <div style="margin: 1em 0;">
        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Teacher{tif count($Section->ActiveTeachers) != 1 ? s}</span>
        <br />
        <span style="display: block; margin-left: 1.5em;">
            {foreach item=Teacher from=$Section->ActiveTeachers implode='<br />'}
                <strong>{$Teacher->FullName|escape}</strong>
                &lt;<a href="mailto:{$Teacher->Email|escape}?subject=Re:%20{$subject|escape:url}" style="color: #a35500;">{$Teacher->Email|escape}</a>&gt;
            {/foreach}
        </span>
    </div>
{/block}

{block fields}{/block}

{block section-notes}
    {if $Report->SectionTermData && trim($Report->SectionTermData->InterimReportNotes)}
        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Section Notes</span>
        <br />
        <div style="display: block; margin: 0 1.5em;">
            {$Report->SectionTermData->InterimReportNotes|escape|markdown}
        </div>
    {/if}
{/block}

{block comments}
    {if $Report->Notes}
        <span style="color: #5e6366; font-size: smaller; font-style: italic;">Comments</span>
        <br />
        <div style="display: block; margin: 0 1.5em;">
            {if $Report->NotesFormat == 'html'}
                {$Report->Notes}
            {elseif $Report->NotesFormat == 'markdown'}
                {$Report->Notes|escape|markdown}
            {else}
                {$Report->Notes|escape}
            {/if}
        </div>
    {/if}
{/block}