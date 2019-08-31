<div class="slate-omnibar site">
    <div class="inner {if $fluid}fluid-width{/if}">
        <ul class="omnibar-items">
            {if $.User}
            <li class="omnibar-item">
                <a class="omnibar-link root-link" href="/dashboard">
                    <img class="slate-logo" src="{versioned_url img/slate-logo-white.svg}" width="41" height="32" alt="Slate">
                    &ensp;Dashboard
                </a>
            </li>
            {/if}

            <li class="omnibar-item omnibar-search-item">
                <form class="omnibar-search-form" action="/search">
                    <input class="omnibar-search-field" name="q" type="search" placeholder="Search" required>
                </form>
            </li>

            {template omnibarChildLink link parentLink=null labelPrefix=null}
                {if $parentLink && !$link.icon && !$link.iconSrc}
                    {if $parentLink.icon}
                        {$link.icon = $parentLink.icon}
                    {/if}
                    {if $parentLink.iconSrc}
                        {$link.iconSrc = $parentLink.iconSrc}
                    {/if}
                {/if}

                {if $link.href}
                    <li class="omnibar-menu-item" {html_attributes_encode $link prefix='data-' deep=no}>
                        <a class="omnibar-menu-link" href="{$link.href|escape}" title="{$link.label|escape}">
                            <figure class="omnibar-menu-icon">
                                <div class="omnibar-menu-image-ct">
                                    <svg class="omnibar-menu-image-bg"><use xlink:href="{versioned_url img/slate-icons/slate-icons.svg}#icon-squircle"/></svg>
                                    <svg class="omnibar-menu-image"><use xlink:href="{versioned_url img/slate-icons/slate-icons.svg}#icon-{$link.icon|default:'link'|escape}"/></svg>
                                </div>
                                <figcaption class="omnibar-menu-label">
                                    {if $labelPrefix}
                                        <small class="muted">{$labelPrefix|escape}</small>
                                    {/if}
                                    {$link.shortLabel|default:$link.label|escape}
                                </figcaption>
                            </figure>
                        </a>
                    </li>
                {/if}

                {if $link.children}
                    {foreach item=childLink from=$link.children}
                        {$parentLabel = $link.shortLabel|default:$link.label}
                        {omnibarChildLink $childLink parentLink=$link labelPrefix=tif($labelPrefix, cat($labelPrefix, ' » ', $parentLabel), $parentLabel)}
                    {/foreach}
                {/if}
            {/template}

            {template omnibarLink link}
                <li class="omnibar-item {if $link.icon}icon-{$link.icon}{/if}" {html_attributes_encode $link prefix='data-' deep=no}>
                    <{if $link.href}a href="{$link.href|escape}"{else}span{/if} class="omnibar-link" {if $link.label != $link.shortLabel}title="{$link.label|escape}"{/if}>
                        {if $link.iconSrc}
                            <img class="omnibar-link-image" src="{$link.iconSrc|escape}" alt="{$link.label|escape}" width="24" height="24">
                        {/if}
                        {$link.shortLabel|default:$link.label|escape}
                    </{tif $link.href ? a : span}>

                    {if $link.children}
                        <div class="omnibar-menu-ct">
                            <ul class="omnibar-menu">
                                {foreach item=childLink from=$link.children}
                                    {omnibarChildLink $childLink parentLink=$link}
                                {/foreach}
                            </ul>
                        </div>
                    {/if}
                </li>
            {/template}

            {foreach item=link from=Slate\UI\Omnibar::getLinks()}
                {omnibarLink $link}
            {/foreach}
        </ul>
    </div>
</div>