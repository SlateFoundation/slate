{extends "designs/print.tpl"}

{block title}
    {$reportPluralNoun|ucfirst}{if $student} for {$student->FullName|escape}{/if}{if $term} in {$term->Title|escape}{/if}
{/block}

{block css}
    {$dwoo.parent}

    <?php
        $recordClass = $this->scope['recordClass'];
        echo $recordClass::getCss();
    ?>
{/block}

{block body}
    {foreach item=studentGroup from=Slate\Progress\Util::groupReportsByStudent($data)}
        {foreach item=termGroup from=Slate\Progress\Util::groupReportsByTerm($studentGroup.reports)}
            <section class="doc-group progress-reports report-type-{$reportSingularNoun|replace:' ':'_'}">
                <header class="top-header">
                    {if $studentGroup.student->Advisor}
                        <aside class="meta advisor">
                            Advisor: {$studentGroup.student->Advisor->FullName}
                            <span class="email">&lt;<a href="mailto:{$studentGroup.student->Advisor->PrimaryEmail|escape}">{$studentGroup.student->Advisor->PrimaryEmail|escape}</a>&gt;</span>
                        </aside>
                    {/if}
                    <h1 class="doc-title">
                        <small class="title-prefix">{$reportSingularNoun|ucfirst} for</small>
                        {$studentGroup.student->FullName|escape}
                        <small class="title-suffix">in {$termGroup.term->Title|escape}</small>
                    </h1>
                </header>

                {foreach item=Report from=$termGroup.reports}
                    <article class="doc-item progress-report report-type-{$reportSingularNoun|replace:' ':'_'}">
                        {$Report->getBodyHtml(2)}
                    </article>
                {/foreach}
            </section>
        {/foreach}
    {foreachelse}
        <p class="empty-report">No reports matching your criteria are available</p>
    {/foreach}
{/block}