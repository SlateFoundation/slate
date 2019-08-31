{extends "designs/site.tpl"}

{block "content"}
    {load_templates "subtemplates/comments.tpl"}
    {$Comment = $data}
    
    <header class="page-header">
        <h1 class="header-title title-2">Comment on &ldquo;{$Comment->Context->getTitle()}&rdquo;</h1>
    </header>

    <div class="reading-width">
        {validationErrors $Comment->validationErrors}
    
        {commentForm $Comment->Context Comment=$Comment}
    </div>

{/block}