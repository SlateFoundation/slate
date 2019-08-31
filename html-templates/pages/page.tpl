{extends "designs/site.tpl"}

{block title}{$data->Title|escape} &mdash; {$dwoo.parent}{/block}

{block content}

    {$Page = $data}
    <article class="cms-page reading-width">
        <header class="page-header">
            <h1 class="header-title title-1">
                <a href="{$Page->getURL()}">{$Page->Title}</a>
            </h1>
            {if Emergence\CMS\PagesRequestHandler::checkWriteAccess($Page, true)}
                <div class="header-buttons">
                    <a href="{$Page->getURL()}/edit" class="button small">Edit</a>&nbsp;
                    <a href="{$Page->getURL()}/delete"
                       class="button destructive confirm small"
                       data-confirm-yes="Delete Page"
                       data-confirm-no="Don&rsquo;t Delete"
                       data-confirm-title="Deleting Post"
                       data-confirm-body="Are you sure you want to delete the page &ldquo;{$Page->Title|escape}?&rdquo;"
                       data-confirm-destructive="true"
                       data-confirm-success-target=".cms-page"
                       data-confirm-success-message="Page deleted">Delete</a>
                </div>
            {/if}
        </header>
    
        <section class="page-body">
            {$Page->renderBody()}
        </section>
    </article>
{/block}