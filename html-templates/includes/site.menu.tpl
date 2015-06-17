{template navChildLink link labelPrefix=null}
    {if $link.href}
        <li class="nav-item" {html_attributes_encode $link prefix='data-' deep=no}>
            <a href="{$link.href|escape}" class="nav-label" title="{$link.label|escape}">
                {if $labelPrefix}
                    <small class="muted">{$labelPrefix|escape}&nbsp;&raquo;</small>
                {/if}
    
                {$link.shortLabel|default:$link.label|escape}
            </a>
        </li>
    {/if}

    {if $link.children}
        {foreach item=childLink from=$link.children}
            {$parentLabel = $link.shortLabel|default:$link.label}
            {navChildLink $childLink labelPrefix=tif($labelPrefix, cat($labelPrefix, ' » ', $parentLabel), $parentLabel)}
        {/foreach}
    {/if}
{/template}

{template navLink link}
    <li class="nav-item {tif $link.children ? 'has-submenu'}" {html_attributes_encode $link prefix='data-' deep=no}>
        <{if $link.href}a href="{$link.href|escape}"{else}span{/if} class="nav-label" title="{$link.label|escape}">
            {$link.shortLabel|default:$link.label|escape}
        </{tif $link.href ? a : span}>

        {if $link.children}
            <ul class="nav-submenu">
                {foreach item=childLink from=$link.children}
                    {navChildLink $childLink}
                {/foreach}
            </ul>
        {/if}
    </li>
{/template}



{$navLinks = Slate\UI\Navigation::getLinks()}

{if count($navLinks)}
    <nav class="site site-nav">
        <div class="inner">
            <ul class="nav-menu">

    
                {foreach item=link from=$navLinks}
                    {navLink $link}
                {/foreach}
            </ul>
        </div>
    </nav>
{/if}