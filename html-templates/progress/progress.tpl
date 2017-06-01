{extends "designs/print.tpl"}

{block title}{strip}
    Progress
    {if $student}
        for {$student->FullName|escape}
    {/if}
    {if $term}
        in {$term->Title|escape}
    {/if}
{/strip}{/block}

{block css}
    {$dwoo.parent}

    {cssmin "reports/progress.css" embed=true}

    {foreach from=$recordTypes item=recordType}
        <?php
            $recordClass = $this->scope['recordType'];
            echo $recordClass::getCSS();
        ?>
    {/foreach}
{/block}

{block body}
    {if $student->Advisor}
        <div class="advisor">
            Advisor: {$student->Advisor->FullName}
            <a href="mailto:{$student->Advisor->PrimaryEmail}">{$student->Advisor->PrimaryEmail}</a>
        </div>
    {/if}
    <h1 class="doc-title">
        {$student->FullNamePossessive|escape} Progress
        {if $term}<br><small>in {$term->Title|escape}</small>{/if}
    </h1>

    {template reports reports}
        {foreach item=Report from=$reports}
            <article class="doc-item progress-report report-type-{$Report->getNoun()|replace:' ':'_'}">
                {$Report->getBodyHtml(3)}
            </article>
        {/foreach}
    {/template}

    {foreach item=typeChunk from=Slate\Progress\Util::chunkReportsByType($data)}
        <section class="doc-group progress-reports report-type-{$typeChunk.singularNoun|replace:' ':'_'}">

            {if is_a($typeChunk.class, 'Slate\\Progress\\IStudentTermReport', true)}
                {foreach item=termGroup from=Slate\Progress\Util::groupReportsByTerm($typeChunk.reports)}
                    <header>
                        <h2 class="group-title">{$typeChunk.noun|ucfirst}</h2>

                        <span class="item-term">{$termGroup.term->Title|escape}</span>
                        <time class="item-datetime">
                            {$termGroup.term->EndDate|date_format:'%b %e, %Y'}
                        </time>
                    </header>

                    {reports $termGroup.reports}
                {/foreach}
            {else}
                <header>
                    <h2 class="group-title">{$typeChunk.noun|ucfirst}</h2>

                    {if count($typeChunk.reports) > 1}
                        <time class="item-datetime">
                            {$typeChunk.timestampMin|date_format:'%b %e, %Y'}&ndash;{$typeChunk.timestampMax|date_format:'%b %e, %Y'}
                        </time>
                    {/if}
                </header>

                {reports $typeChunk.reports}
            {/if}
        </section>
    {foreachelse}
        <p class="empty-report">No reports matching your criteria are available</p>
    {/foreach}
{/block}