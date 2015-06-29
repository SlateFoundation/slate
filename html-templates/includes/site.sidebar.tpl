{template todoItem title complete=false}
    <li class="todo-item {if $complete}is-complete{/if}">
        <label class="todo-item-wrap">
            <input class="todo-item-checkbox" type="checkbox" {if $complete}checked{/if}>
            <div class="todo-item-title"><a class="edit-link" href="#">Edit</a> {$title}</div>
        </label>
    </li>    
{/template}

{*
<div class="sidebar-item todo-ct">
    <h2 class="sidebar-item-title">To-Do List</h2>

    <h3 class="sidebar-group-title"><a href="#" class="pull-right">Why?</a> Slate recommended tasks</h3>
    <ol class="todo-list recommended-todos">
        {loop array(
            array(title => 'Upload Users', complete => true),
            array(title => 'Upload Courses'),
            array(title => 'Create a Blog Post'),
            array(title => 'Create a Page')
        )}
            {todoItem $title $complete}
        {/loop}
    </ol>

    <h3 class="sidebar-group-title"><a href="#" class="pull-right">Clean Up</a> Your tasks</h3>
    <ul class="todo-list">
        {loop array(
            array(title => 'apply for scholarship'),
            array(title => 'email mrs. johnson about research paper next week'),
            array(title => 'research internships and apply', complete => true)
        )}
            {todoItem $title $complete}
        {/loop}
        <li class="todo-item">
            <form class="new-task-form todo-item-wrap">
                <input class="todo-item-checkbox" type="checkbox" disabled>
                <div class="textarea-ct todo-item-title"><textarea placeholder="New task&hellip;"></textarea></div>
<!--            <div class="submit-area"><input class="button small primary" type="submit" value="Add"></div> -->
            </form>
        </li>
    </ul>

    <h3 class="sidebar-group-title"><a href="#" class="pull-right">Hide</a> Completed tasks</h3>
    <ul class="todo-list completed-todo-list">
        {loop array(
            array(title => 'Completed task'),
            array(title => 'Lorem ipsum dolor sit'),
            array(title => 'Third completed task'),
            array(title => 'Every good boy does fine')
        )}
            {todoItem $title complete=true}
        {/loop}
    </ul>

</div>
*}

{$calendarWidget = Slate::getWidgetConfig(calendar)}
{if $calendarWidget.enabled}
    <div class="sidebar-item events-ct">
        <h2 class="sidebar-item-title">Calendar</h2>
        {foreach key=date item=calendarEntries from=Emergence\Events\Event::groupEventsByDate(Emergence\Events\Event::getUpcoming(12))}
            <section class="event-day">
                <h3 class="event-day-heading">{$date|date_format:'%A, %B %e'}</h3>
                {foreach item=calendarEntry from=$calendarEntries}
                    <article class="vevent">
                        {strip}<a class="url" href="/events/{$calendarEntry.Event->Handle}">
                            <span class="summary">{$calendarEntry.Event->Title|escape}</span>
                            {$startMeridiem = strftime('%p', $calendarEntry.start)}
                            {$startTimestamp = strftime('%l:%M', $calendarEntry.start)}

                            {$endMeridiem = strftime('%p', $calendarEntry.end)}
                            {$endTimestamp = strftime('%l:%M', $calendarEntry.end)}

                            {if $startTimestamp == '12:00' && $startMeridiem == 'AM'}
                                {$startTimestamp = 'Midnight'}
                            {/if}

                            {if $endTimestamp == '12:00' && $endMeridiem == 'AM'}
                                {$endTimestamp = 'Midnight'}
                            {/if}

                            <footer class="meta-info">
                                {if $startTimestamp == 'Midnight' && $endTimestamp == 'Midnight'}
                                    All day
                                {else}
                                    <time class="dtstart" datetime="{date('c', $calendarEntry.start)}">
                                        {$startTimestamp}
                                        {if ($startMeridiem != $endMeridiem || $endTimestamp == 'Midnight') && $startTimestamp != 'Midnight'}
                                            &nbsp;{$startMeridiem}
                                        {/if}
                                    </time>&nbsp;&ndash;&nbsp;
                                    <time class="dtend"   datetime="{date('c', $calendarEntry.end)}">
                                        {$endTimestamp}
                                        {if $endTimestamp != 'Midnight'}
                                            &nbsp;{$endMeridiem}
                                        {/if}
                                    </time>
                                {/if}
                            </footer>
                        </a>{/strip}
                    </article>
                {/foreach}
            </section>
        {foreachelse}
            <p class="empty-text">No future events scheduled.</p>
        {/foreach}
    </div>
{/if}

{$twitterWidget = Slate::getWidgetConfig(twitter)}
{if $twitterWidget.enabled}
    <div class="sidebar-item twitter-ct">
        <h2 class="sidebar-item-title">Twitter</h2>
        <a class="twitter-timeline" data-dnt=true href="{$twitterWidget.href}" data-widget-id="{$twitterWidget.widgetId}">Tweets by @{$twitterWidget.handle}</a>
        {literal}<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>{/literal}
    </div>
{/if}