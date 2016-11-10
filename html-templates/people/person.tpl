{extends designs/site.tpl}

{block "title"}{$data->FullName} &mdash; {$dwoo.parent}{/block}

{block "content"}
    {load_templates "subtemplates/blog.tpl"}

    {$Person = $data}
    {$ownProfile = tif($.User->ID == $Person->ID, true, false)}

    <div class="sidebar-layout">
        <div class="main-col">
            <div class="col-inner">

                <header class="page-header">
                    <h2 class="header-title">{$Person->FullName|escape} <small class="muted">Public Feed</small></h2>
                    <div class="header-buttons">
                        {if $ownProfile || (ProfileRequestHandler::$accountLevelEditOthers && $.User->hasAccountLevel(ProfileRequestHandler::$accountLevelEditOthers))}
                            <a class="button" href="/profile{tif $.User->ID != $Person->ID ? cat('?person=', $Person->ID)}">Edit Profile</a>
                        {/if}
                        {if $ownProfile}
                            <a href="/blog/create" class="button primary">Create a Post</a>
                        {/if}
                    </div>
                </header>

                {foreach item=BlogPost from=Emergence\CMS\BlogPost::getAllPublishedByAuthor($Person)}
                    {blogPost $BlogPost headingLevel=h3}
                {foreachelse}
                    <p class="empty-text">No public blog posts yet. {if $ownProfile}<a href="/blog/create">Create a post.</a>{/if}</p>
                {/foreach}

                <footer class="page-footer">
                    <a href="/blog/rss?AuthorID={$Person->ID}"><img src="{versioned_url img/rss.png}" width=14 height=14 alt="RSS"></a>
                </footer>
            </div>
        </div>
        
        <div class="sidebar-col">
            <div class="col-inner">

                {$Person = $data}
            
                {if $Person->PrimaryPhoto}
                <div class="sidebar-item">
                    <a href="{$Person->PrimaryPhoto->WebPath}" class="display-photo-link"><img class="display-photo" src="{$Person->PrimaryPhoto->getThumbnailRequest(646,646)}" alt="Profile Photo: {$Person->FullName|escape}" style="max-width:100%;height:auto" width=323 height=323 /></a>
                </div>
                {/if}
            
                <div class="sidebar-item">
                {if $Person->Biography}
                    <div class="well about-bio">
                        <h4 class="well-title">Bio</h4>
                        {$Person->Biography|escape|markdown}
                    </div>
                {elseif $Person->About}
                    <div class="well about-bio">
                        <h4 class="well-title">About Me</h4>
                        {$Person->About|escape|markdown}
                    </div>
                {/if}
                </div>
            
                {if $.Session->hasAccountLevel('Staff')}
                <div class="sidebar-item">
                    <div class="well profile-contact-info">
                        <h4 class="well-title">Contact Info <small class="muted">(Staff-Only)</small></h4>
                        <dl class="kv-list">
                            {if $Person->Email}
                                <div class="dli">
                                    <dt>Email</dt>
                                    <dd><a href="mailto:{$Person->Email}" title="Email {$Person->FullName|escape}">{$Person->Email}</a></dd>
                                </div>
                            {/if}
                
                            {if $Person->Phone}
                                <div class="dli">
                                    <dt>Phone</dt>
                                    <!-- tel: URL scheme fails in desktop browsers -->
                                    <dd><!-- <a href="tel:{$Person->Phone}"> -->{$Person->Phone|phone}<!-- </a> --></dd>
                                </div>
                            {/if}
 
                             {foreach $Person->Relationships Relationship}
                                <div class="dli">
                                    <dt>{$Relationship->Label}</dt>
                                    <dd>{personLink $Relationship->RelatedPerson photo=no}</dd>
                                </div>
                            {/foreach}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/block}
