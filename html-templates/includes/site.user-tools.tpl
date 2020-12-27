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
                            <small>{$labelPrefix|escape}</small>
                        {/if}
                        {$link.label|default:$link.shortLabel|escape}
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
                <img class="omnibar-link-image" src="{$link.iconSrc|escape}" alt="" width="24" height="24">
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

{template omnibarMobileGroup link}
    <div class="omnibar-overlay-group">
        <h2 class="omnibar-overlay-heading">
            {if $link.href}<a href="{$link.href|escape}" {if $link.label != $link.shortLabel}title="{$link.label|escape}"{/if}>{/if}
                {if $link.iconSrc}
                    <img class="omnibar-link-image" src="{$link.iconSrc|escape}" alt="" width="24" height="24">
                {/if}
                {$link.shortLabel|default:$link.label|escape}
            {if $link.href}&nbsp;<i class="fa fa-arrow-circle-right"></i></a>{/if}
        </h2>

        {if $link.children}
            <ul class="ombnibar-overlay-group-items">
            {foreach item=childLink from=$link.children}
                {omnibarChildLink $childLink parentLink=$link}
            {/foreach}
            </ul>
        {/if}
    </div>
{/template}

<div class="slate-omnibar site mobile-only">
    <div class="inner">
        <ul class="omnibar-items">
            {if $.User}
            <li class="omnibar-item">
                <a class="omnibar-link root-link" href="/dashboard">
                    <img class="slate-logo" src="{versioned_url img/slate-logo-white.svg}" width="41" height="32" alt="Slate">
                </a>
            </li>
            {/if}

            <li class="omnibar-item omnibar-search-item">
                <form class="omnibar-search-form" action="/search">
                    <input class="omnibar-search-field" name="q" type="search" placeholder="Search" required>
                </form>
            </li>

            {if $.User} {* show menu button and build overlay *}
            <li class="omnibar-item omnibar-toggle-item">
                <input class="omnibar-toggle-input" id="omnibar-toggle" type="checkbox">
                <label class="omnibar-toggle-label" for="omnibar-toggle">
                    <svg class="omnibar-toggle-icon" viewBox="0 0 16 16">
                        <g fill="currentColor">
                            <rect width="100%" height="12.5%" y="43.75%"/>
                            <rect width="100%" height="12.5%" y="43.75%"/>
                            <rect width="100%" height="12.5%" y="43.75%"/>
                        </g>
                    </svg>
                </label>
                <div class="omnibar-mobile-overlay">
                    <div class="omnibar-overlay-background"></div>
                    <div class="omnibar-overlay-contents">
                        {foreach item=link from=Slate\UI\Omnibar::getLinks()}
                            {omnibarMobileGroup $link}
                        {/foreach}
                    </div>
                </div>
            </li>
            {else} {* just show the link(s), presumably to log in *}
                {foreach item=link from=Slate\UI\Omnibar::getLinks()}
                    {omnibarLink $link}
                {/foreach}
            {/if}
        </ul>
    </div>
</div>

<div class="slate-omnibar site mobile-hidden">
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

            {foreach item=link from=Slate\UI\Omnibar::getLinks()}
                {omnibarLink $link}
            {/foreach}
        </ul>
    </div>
</div>
