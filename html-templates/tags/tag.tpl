{extends "designs/site.tpl"}

{block title}“{$data->Title|escape}” &mdash; Tags &mdash; {$dwoo.parent}{/block}

{block content}
    {$Tag = $data}

    <header class="page-header">
        <h2 class="header-title">{$Tag->Items|count|number_format} {tif $count == 1 ? item : items} tagged “{$Tag->Title|escape}”</h2>
    </header>

    <section class="page-section">
        <ul>
        {foreach item=Item from=$Tag->getReadableItems()}
            <li>{contextLink $Item->Context}</li>
        {/foreach}
        </ul>
    </section>
{/block}