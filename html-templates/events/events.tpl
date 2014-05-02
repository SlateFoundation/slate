{extends "designs/site.tpl"}

{block title}Events &mdash; {$dwoo.parent}{/block}

{block "content"}
    <h1>Upcoming Events</h1>

    {foreach item=Event from=$data}
        <article class="event-listing">
            <h2 class="event-title"><a class="event-link" href="/events/{$Event->Handle}">{$Event->Title|escape}</a></h2>
            <div class="event-times">
                <time class="event-start">{$Event->StartTime|date_format:'%A, %B %-e, %Y<br>%-l:%M %P'}</time>
                &ndash;
                <time class="event-end">{$Event->EndTime|date_format:'%-l:%M %P'}</time>
            </div>
        </article>
    {/foreach}
{/block}