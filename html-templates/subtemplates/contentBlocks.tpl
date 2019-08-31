{template contentBlock Content contentClass=null extraClass=null}
    {$handle = tif(is_string($Content) ? $Content : $Content->Handle)}
    {$Content = tif(is_string($Content) ? Emergence\CMS\ContentBlock::getByHandle($Content) : $Content)}
    {$renderer = default($Content->Renderer, Emergence\CMS\ContentBlock::getFieldOptions('Renderer', 'default'))}
    {$editable = Emergence\CMS\ContentBlocksRequestHandler::checkWriteAccess($Content, true)}

    <div
        class="
            content-{$renderer}
            {tif $editable ? 'content-editable'}
            {tif $contentClass ? $contentClass : $handle}
            {$extraClass}
        "
        {if $editable}
            data-content-endpoint="{Emergence\CMS\ContentBlock::$collectionRoute}"
            data-content-id="{$handle}"
            {if !$Content}
                data-content-phantom="true"
            {/if}
            data-content-field="Content"
            data-content-value="{$Content->Content|escape}"
            data-content-renderer="{$renderer}"
        {/if}
    >
        {tif $Content ? $Content->getHtml()}
    </div>
{/template}