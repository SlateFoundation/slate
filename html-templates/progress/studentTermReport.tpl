{extends "designs/print.tpl"}

{block title}
    {$data->getNoun()|ucfirst} for {$data->getStudent()->FullName|escape} in {$data->getTerm()->Title|escape}
{/block}

{block css}
    {$dwoo.parent}

    {$data->getCss()}
{/block}

{block body}
    {$Report = $data}
    {$Student = $Report->getStudent()}

    <section class="doc-group progress-reports report-type-{$reportSingularNoun|replace:' ':'_'}">
        <header class="top-header">
            {if $Student->Advisor}
                <aside class="meta advisor">
                    Advisor: {$Student->Advisor->FullName}
                    <span class="email">&lt;<a href="mailto:{$Student->Advisor->PrimaryEmail|escape}">{$Student->Advisor->PrimaryEmail|escape}</a>&gt;</span>
                </aside>
            {/if}
            <h1 class="doc-title">
                <small class="title-prefix">{$Report->getNoun()|ucfirst} for</small>
                {$Student->FullName|escape}
                <small class="title-suffix">{$Report->getTerm()->Title|escape}</small>
            </h1>
        </header>

        <article class="doc-item progress-report report-type-{$Report->getNoun()|replace:' ':'_'}">
            {$Report->getBodyHtml(2)}
        </article>
    </section>
{/block}