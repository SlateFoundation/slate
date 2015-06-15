{$menus = array(
    'About',
    'Students',
    'Parents',
    'Staff',
    'Community',
    'Calendar',
    'Contact Us')}

{$menuItems = array(
    'Mission and Vision',
    'Admissions',
    'Curriculum',
    'Student Handbook',
    'About SLA',
    'Giving to SLA')}

<nav class="site site-nav">
    <div class="inner">
        <ul class="nav-menu">
            {foreach item=menu from=$menus}
                {$last = $dwoo.foreach.default.last}
                {$tag = tif($last, 'a', 'span')}
                <li class="nav-item {if !$last}has-submenu{/if}">
                    <{$tag} class="nav-label" href="/{$menu|whitespace:'_'}">{$menu}</{$tag}>
                    {if !$last}
                        <ul class="nav-submenu">
                            {loop $menuItems}
                                <li class="nav-item">
                                    <a class="nav-label" href="{$|whitespace:'_'}">{$}</a>
                                </li>
                            {/loop}
                        </ul>
                    {/if}
                </li>
            {/foreach}
        </ul>
    </div>
</nav>