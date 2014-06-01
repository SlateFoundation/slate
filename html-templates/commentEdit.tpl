{extends "designs/site.tpl"}

{block "content"}
    {$Comment = $data}
    
    <header class="page-header">
        <h3 class="header-title">Comment {if $Comment->getTitle()} on “{$Comment->Context->Title}”{/if}</h3>
    </header>

    <div class="reading-width">
        {validationErrors $Comment->validationErrors}
    
        {commentForm $Comment->Context}
    </div>

{/block}