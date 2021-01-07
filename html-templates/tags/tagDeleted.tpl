{extends designs/site.tpl}

{block "content"}
    {capture assign=tagName}{$data->Title|escape}{/capture}
    <p class="notify">{sprintf(_("Tag %s has been deleted."), $tagName)}</p>

    <p><a href="/tags">{_ "Retun to tag list"}</a></p>
{/block}
