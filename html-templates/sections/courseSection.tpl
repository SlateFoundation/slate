{extends "designs/site.tpl"}

{block meta}
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/sections/{$data->Handle}/rss">
{/block}

{block title}{$data->getTitle()|escape} &mdash; {$dwoo.parent}{/block}

{block js-bottom}
    <script type="text/javascript">
        var SiteEnvironment = SiteEnvironment || { };
        SiteEnvironment.courseSection = {JSON::translateObjects($data, false, 'recordURL')|json_encode};
    </script>

    {$dwoo.parent}

    {if !$.get.jsdebug}
        <script src="{Site::getVersionedRootUrl('js/pages/CourseSection.js')}"></script>
    {/if}

    <script>
        Ext.require('Site.page.CourseSection');
    </script>
{/block}


{block "content"}
    {load_templates "subtemplates/blog.tpl"}
    {load_templates "subtemplates/paging.tpl"}

    {$Section = $data}

    <div class="sidebar-layout">
        <div class="main-col">
            <div class="col-inner">
                <header class="page-header">
                    <h2 class="header-title">
                      {$Section->getTitle()|escape}
                      <small class="muted">
                        Public Feed
                        {if $blogTag}
                          for tag <code>{$blogTag->getTitle()|escape}</code>
                        {/if}
                      </small>
                    </h2>
                    <div class="header-buttons"><a href="{$Section->getURL()}/post" class="button primary">Create a Post</a></div>
                </header>

                {if $latestTeacherPost}
                    {blogPost $latestTeacherPost headingLevel="h3" articleClass="well" titlePrefix='<i class="fa fa-thumb-tack"></i>&ensp;'}
                {/if}

                {foreach item=BlogPost from=$blogPosts}
                    {blogPost $BlogPost headingLevel="h3" includeSummaryInBody=true}
                {foreachelse}
                    <p class="empty-text">This class has no posts in its public feed yet.</p>
                {/foreach}

                <footer class="page-footer">
                    {if $total > $limit}
                        <div class="pagingLinks">
                            <strong>{$total|number_format} post{tif $total != 1 ? s}:</strong> {pagingLinks $total pageSize=$limit}
                        </div>
                    {/if}

                    <a href="/sections/{$Section->Handle}/rss"><img src="{versioned_url img/rss.png}" width=14 height=14 alt="RSS"></a>
                </footer>
            </div>
        </div>

        <div class="sidebar-col">
            <div class="col-inner">

                <div class="sidebar-item">
                    <section class="well course-section-details">
                        <h3 class="well-title">
                            <div class="pull-right muted">
                                <i class="fa fa-info-circle"></i>
                            </div>
                            {$Section->Code|escape}
                        </h3>

                        {if $Section->Course->Description}
                            <div class="muted markdown-ct">{$Section->Course->Description|escape|markdown}</div>
                        {/if}

                        <dl class="kv-list align-right">
                            <div class="dli">
                                <dt>Term</dt>
                                <dd>{$Section->Term->Title}</dd>
                            </div>

                            {if $.User}
                                <div class="dli">
                                    <dt>Schedule</dt>
                                    <dd>{$Section->Schedule->Title}</dd>
                                </div>
                                <div class="dli">
                                    <dt>Location</dt>
                                    <dd>{$Section->Location->Title}</dd>
                                </div>
                            {/if}

                            {if $Section->Notes}
                                <div class="dli">
                                    <dt>Notes</dt>
                                    <dd class="markdown-ct">{$Section->Notes|escape|markdown}</dd>
                                </div>
                            {/if}
                        </dl>
                    </section>
                </div>

                {template linksEntry entry}
                    {if $entry.href}<a href="{$entry.href|escape}" {$entry.attribs}>{/if}
                        {$entry.label|escape}
                    {if $entry.href}</a>{/if}
                {/template}

                {foreach item=linkGroup from=Slate\UI\SectionProfile::getLinks($Section)}
                    {* spaces in key names here are parsed wrong *}
                    {$linksIcons = array(
                        'CourseTools' => 'wrench',
                        'OtherWebsites' => 'external-link',
                    )}
                    {$labelNoSpaces = str_replace(' ', '', $linkGroup.label)}

                    <div class="sidebar-item">
                        <div class="well profile-contact-info">
                            <h3 class="well-title">
                                <div class="pull-right muted">
                                    <i class="fa fa-{$linksIcons[$labelNoSpaces]|default:'link'}"></i>
                                </div>

                                {linksEntry $linkGroup}
                            </h3>

                            <dl class="kv-list">
                                {foreach item=link from=$linkGroup.children}
                                    {if $link.children}
                                        <div class="dli">
                                            <dt>{linksEntry $link}</dt>
                                            {foreach item=subLink from=$link.children}
                                                <dd>{linksEntry $subLink}</dd>
                                            {/foreach}
                                        </div>
                                    {else}
                                        <dd>{linksEntry $link}</dd>
                                    {/if}
                                {/foreach}
                            </dl>
                        </div>
                    </div>
                {/foreach}

                {if count($tags) > 0}
                <div class="sidebar-item">
                    <div class="well">
                        <h3 class="well-title">
                            <span class="pull-right muted">
                                <i class="fa fa-tag"></i>
                            </span>
                            Blog Tags
                        </h3>

                        {* if there's 10 or more, show the first five and collapse the rest *}
                        {if count($tags) >= 10}
                            {$tagsShown = array_slice($tags, 0, 5)}
                            {$tagsHidden = array_slice($tags, 5)}
                        {else}
                        {* less than 10, just show them all *}
                            {$tagsShown = $tags}
                        {/if}

                        <ul class="tag-list">
                        {foreach item=tag from=$tagsShown}
                            <li>
                                <a class="tag" href="?blog-tag={$tag.Handle}">{$tag.Title|escape} <span class="tag-count">{$tag.itemsCount}</span></a>
                            </li>
                        {/foreach}
                        </ul>

                        {if $tagsHidden}
                            <details class="sidebar-collapsible">
                                <summary class="sidebar-collapsible-toggle">
                                    <span class="collapsible-expand-text">See all</span>
                                    <span class="collapsible-collapse-text">See less</span>
                                </summary>

                                <ul class="tag-list">
                                {foreach item=tag from=$tagsHidden}
                                    <li>
                                        <a class="tag" href="?blog-tag={$tag.Handle}">{$tag.Title|escape} <span class="tag-count">{$tag.count}</span></a>
                                    </li>
                                {/foreach}
                                </ul>
                            </details>
                        {/if}
                    </div>
                </div>
                {/if}

                <div class="sidebar-item">
                    <div class="well">
                        <h3 class="well-title">
                            <span class="pull-right muted">
                                <i class="fa fa-star"></i>
                            </span>
                            Teacher{tif count($Section->ActiveTeachers) != 1 ? s}
                        </h3>
                        <ul class="roster teachers">
                        {foreach item=Teacher from=$Section->ActiveTeachers}
                            <li>{personLink $Teacher photo=true}</li>
                        {foreachelse}
                            <p class="empty-text">No instructors currently listed.</p>
                        {/foreach}
                        </ul>
                    </div>
                </div>

                {if $.User}
                <div class="sidebar-item">
                    <div class="well">
                        <h3 class="well-title">
                            <span class="pull-right muted">
                                <i class="fa fa-graduation-cap"></i>
                            </span>
                            Students
                        </h3>
                        <ul class="roster students">
                        {foreach item=Student from=$Section->ActiveStudents}
                            <li>{personLink $Student photo=true}</li>
                        {foreachelse}
                            <p class="empty-text">No students currently listed.</p>
                        {/foreach}
                        </ul>
                    </div>
                </div>
                {/if}
            </div>
        </div>
    </div>
{/block}
