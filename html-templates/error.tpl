{extends "designs/site.tpl"}

{block "content"}
    <header class="page-header">
        <h2 class="header-title">Uh-oh&hellip;</h2>
    </header>
    
    <p class="lead reading-width">{$message|default:'Something went wrong. Please try again or contact an administrator.'}</p>
{/block}