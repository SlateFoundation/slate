{template nav navItems mobileHidden=false mobileOnly=false}
    {* navItems should be an array: page name/responseId => 'optional description' *}
	<nav class="nav site {if $mobileHidden}mobile-hidden{/if} {if $mobileOnly}mobile-only{/if}">
		<ul>
		{foreach $navItems navItemId navItemDesc}
			{if $navItemId == 'template'}{$navItemId = ''}{/if}
			{$navItemDesc = default($navItemDesc, ucfirst($navItemId))}
			
			<li><a href="/{$navItemId}" {if $.responseId == $navItemId} class="current"{/if}>{$navItemDesc}</a></li>
		{/foreach}
		</ul>
	</nav>
{/template}