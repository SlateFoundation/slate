{extends "designs/site.tpl"}

{block meta}
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/sections/{$Section->Handle}/rss">
{/block}

{block js-bottom}
    <script type="text/javascript">
        window.CourseSectionData = {$data->getData()|json_encode};
    </script>

    {$dwoo.parent}

    {if $.get.jsdebug}
        <script>
            Ext.require('Site.page.CourseSection');
        </script>
    {else}
        <script src="{Site::getVersionedRootUrl('js/pages/CourseSection.js')}"></script>
    {/if}
{/block}


{block "content"}
    {$Section = $data}

    <header>
        <hgroup>
            <h1>{$Section->Title|escape}</h1>
            <div class="mini-page-tools"><a href="/sections/{$Section->Handle}/post" class="button primary">Create a Post</a></div>
            <h2>Public Feed</h2>
        </hgroup>
    </header>

    {$limit = 10}
    {$blogPosts = Emergence\CMS\BlogPost::getAllPublishedByContextObject($Section, array(limit=$limit,offset=$.get.offset))}
    {$total = DB::foundRows()}

    {foreach item=BlogPost from=$blogPosts}
        {blogPost $BlogPost}
    {foreachelse}
        <p class="muted">This class has no posts in its public feed yet.</p>
    {/foreach}


    <footer class="page-footer">
        {if $total > $limit}
            <div class="pagingLinks">
                <strong>{$total|number_format} post{tif $total != 1 ? s}:</strong> {pagingLinks $total pageSize=$limit}
            </div>
        {/if}

        <a href="/sections/{$Section->Handle}/rss"><img src="/img/rss.png" width=14 height=14 alt="RSS"></a>
    </footer>
{/block}

{block "sidebar"}
    {$Section = $data}
    
        <dl class="well course-section-details property-list">
            <h3>{$Section->Code}</h3>

            {if $Section->Course->Description}
                <div class="muted markdown-ct">{$Section->Course->Description|escape|markdown}</div>
            {/if}

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
    
    {*
        {$MoodleMapping = SynchronizationMapping::getByWhere(array(
            ContextClass = 'CourseSection'
            ,ContextID = $Section->ID
            ,ExternalSource = 'MoodleIntegrator'
            ,ExternalKey = 'id'
        ))}
    
        {if $MoodleMapping}
            <h2>Links</h2>
            <ul>
                <li><a href="/cas/login?service={urlencode('http://moodle.scienceleadership.org/course/view.php?id=')}{$MoodleMapping->ExternalIdentifier}" title="Visit {$Section->Code} on Moodle">Moodle / {$Section->Code|escape}</a></li>
            </ul>
        {/if}
    *}
    
    {if $.User->hasAccountLevel(Staff)}
        <h3>Course Tools</h3>
        <ul class="course-section-tools">
            <li class="copy-email"><a class="button" href="#copy-section-emails">Copy Email List</a></li>
            <li class="download-roster"><a class="button" href="/sections/{$Section->Handle}/roster-download">Download Roster</a></li>
        </ul>
    {/if}
    

    <h3>Instructor{tif count($Section->Instructors) != 1 ? s}</h3>
    <ul class="roster instructors">
    {foreach item=Instructor from=$Section->Instructors}
        <li>{personLink $Instructor photo=true}</li>
    {/foreach}
    </ul>

    {if $.User}
        <h3>Students</h3>
        <ul class="roster students">
        {foreach item=Student from=$Section->Students}
            <li>{personLink $Student photo=true}</li>
        {/foreach}
        </ul>
    {/if}
{/block}
