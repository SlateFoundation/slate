{extends "design.tpl"}

{block "content"}
    <form method="POST" class="card">
        {if $title}
            <h1 class="card-header {if $statusClass}bg-{$statusClass} text-white{/if}">{$title|escape}</h1>
        {/if}

        <div class="card-body">
            {$message|escape|markdown}

            <a href="{$returnURL|default:"javascript:history.go(-1)"}" class="btn btn-secondary">{$returnLabel|default:"&laquo; Back"}</a>
        </div>
    </div>
{/block}