{template contextLink Context prefix='' suffix='' class=''}{strip}

{if !$Context}
	<em>[context deleted]</em>
{elseif is_a($Context, 'Person')}
	<a href="/people/{$Context->Handle}" class="{$class}">{$prefix}{$Context->FullNamePossessive|escape} Profile{$suffix}</a>
{elseif is_a($Context, 'Media')}
	<a href="{$Context->getThumbnailRequest(1000,1000)}" class="attached-media-link {$class}" title="{$Context->Caption|escape}">
		{$prefix}
		<img src="{$Context->getThumbnailRequest(25,25)}" alt="{$Context->Caption|escape}">
		&nbsp;{$Context->Caption|escape}
		{$suffix}
	</a>
{elseif is_a($Context, 'Discussion')}
	<a href="/discussions/{$Context->Handle}" class="{$class}">{$prefix}Discussion: {$Context->Title|escape}{$suffix}</a>
{elseif is_a($Context, 'Emergence\Events\Event')}
	<a href="/events/{$Context->Handle}" class="{$class}">{$prefix}Event: {$Context->Title|escape}{$suffix}</a>
{elseif is_a($Context, 'Emergence\CMS\BlogPost')}
	<a href="/blog/{$Context->Handle}" class="{$class}">{$prefix}{$Context->Title|escape}{$suffix}</a>
{elseif is_a($Context, 'Emergence\CMS\Page')}
	<a href="/pages/{$Context->Handle}" class="{$class}">{$prefix}{$Context->Title|escape}{$suffix}</a>
{elseif is_a($Context, 'CourseSection')}
	<a href="/sections/{$Context->Handle}" class="{$class}" title="{$Context->Title|escape}">{$prefix}{$Context->Code|escape}{$suffix}</a>
{else}
	<a href="/{Router::getClassPath($Context)}/{tif $Context->Handle ? $Context->Handle : $Context->ID}" class="{$class}">{$Context->Title|escape}</a>
{/if}

{/strip}{/template}