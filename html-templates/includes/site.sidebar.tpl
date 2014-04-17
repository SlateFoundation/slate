{$calendarWidget = Slate::getWidgetConfig(calendar)}
{if $calendarWidget.enabled}
	<div class="sidebar-item events-ct">
		{foreach key=date item=calendarEntries from=Emergence\Events\Event::groupEventsByDate(Emergence\Events\Event::getUpcoming(12))}
			<section class="event-day">
				<h3>{$date|date_format:'%A, %B %e'}</h3>
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
			<em>No future events scheduled</em>
		{/foreach}
	</div>
{/if}

{$twitterWidget = Slate::getWidgetConfig(twitter)}
{if $twitterWidget.enabled}
	<div class="sidebar-item twitter-ct">
		<a class="twitter-timeline" data-dnt=true href="{$twitterWidget.href}" data-widget-id="{$twitterWidget.widgetId}">Tweets by @{$twitterWidget.handle}</a>
		{literal}<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>{/literal}
	</div>
{/if}