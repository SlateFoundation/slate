{template pagingLinks total pageSize=12}
    {strip}
    {if $total > $pageSize}
        <?php
            $this->scope['previousOffset'] = isset($_GET['offset']) && $_GET['offset'] > $pageSize ? $_GET['offset'] - $pageSize : 0;
            $this->scope['nextOffset'] = isset($_GET['offset']) ? $_GET['offset'] + $pageSize : $pageSize;
        ?>
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
    {/if}
    {/strip}
{/template}