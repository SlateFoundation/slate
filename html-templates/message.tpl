{extends "designs/site.tpl"}

{block "content"}
    {if $header}
        <h1>{$header}</h1>
    {/if}

	<p class="message">{$message}</p>
    
<a href="{$returnURL|default:"javascript:history.go(-1)"}">{$returnLabel|default:"&laquo; Back"}</a>
{/block}