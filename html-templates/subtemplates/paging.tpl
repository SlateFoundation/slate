{template pagingLinks total pageSize=12 showAll=false}
<div class="paging">
    {if $total > $pageSize}
        {$previousOffset = tif($.get.offset && $.get.offset > $pageSize ? $.get.offset - $pageSize : 0)}
        {$nextOffset = tif($.get.offset ? $.get.offset + $pageSize : $pageSize)}
        {if $.get.offset > 0}
            <a class="paging-link prev" href="?{refill_query limit=$pageSize offset=$previousOffset}">&larr;&nbsp;Prev</a>
        {/if}

        <ol class="paging-pages">
        {foreach item=page from=range(1,ceil($total/$pageSize))}
            {math "($page-1)*$pageSize" assign=offset}
            <li class="paging-page">
                {if $.get.offset == $offset}
                    <strong class="paging-current">{$page}</strong>
                {else}
                    <a class="paging-link" href="?{refill_query limit=$pageSize offset=$offset}">{$page}</a>
                {/if}
            </li>
        {/foreach}
        </ol>

        {if $.get.offset < $total - $pageSize}
            <a class="paging-link next" href="?{refill_query limit=$pageSize offset=$nextOffset}">Next&nbsp;&rarr;</a>
        {/if}

        {if $showAll}
            <a class="paging-link show-all" href="?{refill_query limit=0 offset=null}">Show All ({$total|number_format})</a>
        {/if}
    {/if}
</div>
{/template}

{template pagingArrows count total limit offset}
    {if $limit}
        Showing {$offset+1|number_format}&ndash;{$offset+$count|number_format} of {$total|number_format}
        {if $offset}
            <a class="paging-link previous" href="?{refill_query offset=$offset-$limit}">&larr;&nbsp;Previous</a>
        {/if}
        {if ($count == $limit) && ($total > $offset+$count)}
            <a class="paging-link next" href="?{refill_query offset=$offset+$limit}">Next&nbsp;&rarr;</a>
        {/if}
    {/if}
{/template}