{template recordItem Record body}
    <article class="doc-item">
        <header class="doc-header">
            <h3 class="item-title">{$Record.SectionTitle} <small class="item-datetime">{$Record.TermTitle}</small></h3>

            <div class="meta">
                <span class="item-creator">
                    {$Record.TeacherFullName}
                    &lt;<a class="url" href="mailto:{$Record.TeacherEmail}">{$Record.TeacherEmail}</a>&gt;
                </span>
            </div>
        </header>

        <div class="item-body">
            {$body}
        </div>
    </article>
{/template}

{template progressnote Record}
    <article class="doc-item">
        <header class="doc-header">
            <h3 class="item-title">{$Record.Subject}</h3>

            <div class="meta">
                <span class="item-creator">
                    {$Record.AuthorFullName}
                    &lt;<a class="url" href="mailto:{$Record.AuthEmail}">{$Record.AuthorEmail}</a>&gt;
                </span>
            </div>
        </header>

        <div class="item-body">
            {$Record.Message}
        </div>
    </article>
{/template}

{template standards Standards}
    {$gradeLabels = array(
        "N/A" = "Standard Not Applicable During the Semester",
        1 = "Not Currently Meeting <small>Expectations</small>",
        2 = "Approaching <small>Expectations</small>",
        3 = "Meeting <small>Expectations</small>",
        4 = "Exceeding <small>Expectations</small>"
    )}

    {capture 'body'}
        {foreach item=Standard from=$Standards.Prompts}
            <section class="subsection">
                <h4 class="subhead float-right">{if $Standard.Grade != "N/A"}{$gradeLabels[$Standard.Grade]}{else}<small>{$Standard.Grade}</small>{/if}</h4>
                <p>{$Standard.Prompt}</p>
            </section>
        {/foreach}
    {/capture}

    {recordItem $Standards $.capture.body}
{/template}

{template narrative Narrative}
    {capture 'body'}
        <h4 class="grade">{$Narrative.Grade}</h4>
        <div class="freetext">{$Narrative.Assessment}</div>
    {/capture}

    {recordItem $Narrative $.capture.body}
{/template}

{template interim Interim}
    {capture 'body'}
        <h4 class="grade">{$Interim.Grade}</h4>
        <div class="freetext">{$Interim.Comments}</div>
    {/capture}

    {recordItem $Interim $.capture.body}
{/template}