{extends "designs/site.tpl"}

{block "content"}
    <p class="status">Comment saved.</p>
    {contextLink Context=$data->Context prefix="Return to " suffix=" &raquo;"}
{/block}