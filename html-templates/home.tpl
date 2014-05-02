{extends "designs/site.tpl"}
{block "body-class"}home{/block}

{block "content"}

    {$importantTag = Tag::getByHandle('important')}
    {if $importantTag}
        {$importantPages = $importantTag->getItemsByClass('Emergence\CMS\Page', array(conditions = array(Class='Emergence\CMS\Page'), order = Published))}

        {if count($importantPages)}
            <div class="important-links">
                <span class="links-label">Important pages:</span>
                <ul class="links-list">
                    {foreach item=Page from=$importantPages}
                        <li class="links-list-item"><a class="links-list-link" href="/pages/{$Page->Handle}">{$Page->Title|escape}</a></li>
                    {/foreach}
                </ul>
            </div>
        {/if}
    {/if}

    {$homepageTag = Tag::getByHandle('homepage')}
    {if $homepageTag}
        {$homePages = $homepageTag->getItemsByClass('Emergence\CMS\Page', array(conditions = array(Class='Emergence\CMS\Page'), order = Published))}

        {foreach item=homePage from=$homePages}
            <h1>{$homePage->Title|escape}</h1>
            {$homePage->renderBody()}
        {/foreach}

        {$blogPosts = $homepageTag->getItemsByClass('Emergence\CMS\BlogPost', array(conditions = array(Class='Emergence\CMS\BlogPost',Status=Published,Visibility=Public,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'), order = array(Published=DESC), limit = 5))}

        {if count($blogPosts)}
            <section class="content content-blog">
            {foreach item=BlogPost from=$blogPosts}
                {blogPost $BlogPost}
            {/foreach}
        {/if}
    {/if}

{/block}