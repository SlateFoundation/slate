{extends "designs/site.tpl"}

{block "content"}
    <p class="status">Comment deleted.</p>
    {contextLink Context=$data->Context prefix="Return to " suffix=" &raquo;"}
{/block}