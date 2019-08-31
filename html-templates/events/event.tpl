{extends "designs/site.tpl"}

{block title}{$data->Title|escape} &mdash; Events &mdash; {$dwoo.parent}{/block}

{block "content"}
    {load_templates "subtemplates/comments.tpl"}
    {$Event = $data}

    <header class="page-header">
        <h2 class="header-title">{$Event->Title|escape}</h2>
    </header>
    
    <div class="sidebar-layout">

        <div class="main-col">
            <div class="col-inner">

                {if $Event->Description}<div class="event-description">{$Event->Description|escape|markdown}</div>{/if}
                {if $.User->hasAccountLevel('Staff')}
                    <p class="hint">Staff Hint: when entering event descriptions, you can use <a href="http://daringfireball.net/projects/markdown/basics" target="_blank">Markdown</a> for formatting.</p>
                {/if}
                {commentSection $Event}

            </div>
        </div>
        
        <div class="sidebar-col">
            <div class="col-inner">

                <dl class="well kv-list">
                    {if $Event->Feed}
                        <div class="dli">
                            <dt>Calendar</dt>
                            <dd><a href="{$Event->Feed->Link|escape}" class="ical">{$Event->Feed->Title|escape}</a></dd>
                        </div>
                    {/if}
            
                    <div class="dli">
                        <dt>Starts</dt>
                        <dd>{$Event->StartTime|date_format:'%A, %b %-e, %Y @ %-l:%M %P'}</dd>
                    </div>
            
                    <div class="dli">
                        <dt>Ends</dt>
                        <dd>{$Event->EndTime|date_format:'%A, %b %-e, %Y @ %-l:%M %P'}</dd>
                    </div>
            
                    {if $Event->Location}
                        <div class="dli">
                            <dt>Location</dt>
                            <dd>{$Event->Location|escape}</dd>
                        </div>
                    {/if}
                </dl>

            </div>
        </div>

    </div>
{/block}