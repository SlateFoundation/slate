<header class="doc-header">
    {block header}
        <h{$headingLevel} class="item-title">{block title}{$Report->Section->Title|escape}{/block}</h{$headingLevel}>

        <div class="meta">
            {block meta}
                {if $.get.print.author != 'no'}
                    {$author = $Report->getAuthor()}
                    <span class="item-creator">
                        {$author->FullName|escape}
                        {if $author->Email}&lt;<a class="url" href="mailto:{$author->Email|escape}">{$author->Email|escape}</a>&gt;{/if}
                    </span>
                {/if}
            {/block}
        </div>
    {/block}
</header>

<dl class="item-body">
    {block teachers}
        {if $.get.print.teachers != 'no' && count($Report->Section->ActiveTeachers) && !(count($Report->Section->ActiveTeachers) == 1 && $Report->Section->ActiveTeachers[0]->ID == $Report->getAuthor()->ID)}
            <div class="dli">
                <dt class="instructor">Teacher{tif count($Report->Section->ActiveTeachers) != 1 ? s}</dt>
                <dd class="instructor">
                    <ul>
                        {foreach item=Teacher from=$Report->Section->ActiveTeachers}
                                <li>
                                    <span class="instructor-name">{$Teacher->FullName|escape}</span>
                                    <span class="instructor-email"><a href="mailto:{$Teacher->Email|escape}">{$Teacher->Email|escape}</a></span>
                                </li>
                        {/foreach}
                    </ul>
                </dd>
            </div>
        {/if}
    {/block}

    {block fields}{/block}

    {block section-notes}
        {if $.get.print.section_notes != 'no' && $Report->SectionTermData && trim($Report->SectionTermData->TermReportNotes)}
            <div class="dli">
                <dt class="comments">Section Notes</dt>
                <dd class="comments">{$Report->SectionTermData->TermReportNotes|escape|markdown}</dd>
            </div>
        {/if}
    {/block}

    {block comments}
        {if $.get.print.notes != 'no' && $Report->Notes}
            <div class="dli">
                <dt class="comments">Notes</dt>
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