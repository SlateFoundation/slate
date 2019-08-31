{extends "designs/site.tpl"}
{block "body-class"}home{/block}

{block "header-class"}reveal-hero{/block}

{block "content"}
    {load_templates "subtemplates/blog.tpl"}
    <div class="sidebar-layout">
    
        <div class="main-col">
            <div class="col-inner">
                {$importantTag = Tag::getByHandle('important')}
                {if $importantTag}
                    {$importantPages = $importantTag->getItemsByClass('Emergence\CMS\Page', array(conditions = array(Class='Emergence\CMS\Page',Status=Published,Visibility=Public,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'), order = Published))}
            
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
                    {$homePages = $homepageTag->getItemsByClass('Emergence\CMS\Page', array(conditions = array(Class='Emergence\CMS\Page',Status=Published,Visibility=Public,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'), order = Published))}
            
                    {foreach item=homePage from=$homePages}
                        <section class="page-section">
                            <header class="section-header">
                                <h2 class="header-title">{$homePage->Title|escape}</h2>
                            </header>
                            {$homePage->renderBody()}
                        </section>
                    {/foreach}
            
                    {$blogPosts = $homepageTag->getItemsByClass('Emergence\CMS\BlogPost', array(conditions = array(Class='Emergence\CMS\BlogPost',Status=Published,Visibility=Public,'Published IS NULL OR Published <= CURRENT_TIMESTAMP'), order = array(Published=DESC), limit = 5))}
            
                    {if count($blogPosts)}
                        <section class="content content-blog">
                        {foreach item=BlogPost from=$blogPosts}
                            {blogPost $BlogPost}
                        {/foreach}
                        </section>
                    {/if}
                {/if}
            </div>
        </div>
    
        <div class="sidebar-col">
            <div class="col-inner">
                {include "includes/site.sidebar.tpl"}
            </div>
        </div>
    </div>
{/block}