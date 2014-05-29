{extends "designs/site.tpl"}

{block title}{$data->Title|escape} &mdash; {$dwoo.parent}{/block}

{block content}

    {$Page = $data}

    <header class="page-header">
        <h2 class="header-title">
            <a href="/pages/{$Page->Handle}">{$Page->Title}</a>
        </h2>
        {if Emergence\CMS\PagesRequestHandler::checkWriteAccess($Page, true)}
            <div class="header-buttons">
                <a href="/pages/{$Page->Handle}/edit" class="button primary">Edit</a>
            </div>
        {/if}
    </header>

    <section class="post-body">
        {$Page->renderBody()}
    </section>
{/block}