{extends "designs/site.tpl"}

{block title}{if $.request.q}“{$.request.q|escape}” &mdash;{/if} {$dwoo.parent}{/block}

{block content}
    <header class="page-header">
        <h2 class="header-title">Search {if $.request.q}for “{$.request.q|escape}”{/if}</h2>
    </header>

    {if !array_filter($data)}
        <p class="empty-text">No results found.</p>
    {else}
        <div class="full-search-results">
            {foreach key=className item=results from=array_filter($data)}
                {$count = count($results)}
                <section class="page-section">
                    <header class="section-header">
                        <h3 class="header-title" id="results-{$className}">{$count|number_format} {Inflector::pluralizeRecord($className, $count)}</h3>
                    </header>
                    <ul>
                    {foreach item=result from=$results}
                        <li>{contextLink $result summary=yes}</li>
                    {/foreach}
                    </ul>
                </section>
            {/foreach}
        </div>
    {/if}

{/block}