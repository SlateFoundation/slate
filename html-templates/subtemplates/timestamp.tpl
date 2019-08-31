{template timestamp timestamp time=no}{strip}
    {if $time === 'auto'}
        {$time = tif(date('Hi', $timestamp) == '0000' ? false : true)}
    {/if}
    <time datetime="{date($.const.DATE_W3C, $timestamp)}" title="{$timestamp|date_format:"%c"}">
        {$timestamp|date_format:tif($time, "%-d %b %Y, %l:%M %P", "%-d %b %Y")}
    </time>
{/strip}{/template}
