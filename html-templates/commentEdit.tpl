{extends "designs/site.tpl"}

{block "content"}
    {$Comment = $data}
    
    <header class="page-header">
        <h3 class="header-title">Comment on &ldquo;{$Comment->Context->getTitle()}&rdquo;</h3>
    </header>

    <div class="reading-width">
        {validationErrors $Comment->validationErrors}
    
        {commentForm $Comment->Context Comment=$Comment}
    </div>

{/block}