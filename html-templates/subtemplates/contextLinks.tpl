{load_templates "subtemplates/people.tpl"}

{template contextLink Context prefix='' suffix='' class='' summary=no}{strip}

{if !$Context}
    <em>[context deleted]</em>
{elseif is_a($Context, 'Media')}
    <a href="{$Context->getThumbnailRequest(1000,1000)}" class="attached-media-link {$class}" title="{$Context->Caption|escape}">
        {$prefix}
        <img src="{$Context->getThumbnailRequest(25,25)}" alt="{$Context->Caption|escape}">
        &nbsp;{$Context->Caption|escape}
        {$suffix}
    </a>
{elseif is_a($Context, 'Emergence\People\IPerson')}
    {personLink $Context summary=$summary}
{else}
    {$url = $Context->getUrl()}
    <{if $url}a href="{$url|escape}"{else}span{/if} class="{$class}">{$prefix}{$Context->getTitle()|escape}{$suffix}</{tif $url ? a : span}>
{/if}

{/strip}{/template}