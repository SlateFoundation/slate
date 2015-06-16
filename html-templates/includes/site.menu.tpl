<nav class="site site-nav">
    <div class="inner">
        <ul class="nav-menu">
            {foreach key=text item=target from=Slate\UI\Navigation::getSiteMenu()}
                <li class="nav-item {if is_array($target)}has-submenu{/if}">
                    {if is_array($target)}
                        <span class="nav-label">{$text|escape}</span>
                        <ul class="nav-submenu">
                            {foreach key=subText item=subTarget from=$target}
                                <li class="nav-item">
                                    <a class="nav-label" href="{$subTarget|escape}">{$subText|escape}</a>
                                </li>
                            {/foreach}
                        </ul>
                    {else}
                        <a class="nav-label" href="{$target|escape}">{$text|escape}</a>
                    {/if}
                </li>
            {/foreach}
        </ul>
    </div>
</nav>