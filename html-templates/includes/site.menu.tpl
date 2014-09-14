{template menuItem label url=no}
    {if is_string($url)}
        <li class="menu-item"><a class="menu-label" href="{$url|escape}">{$label|escape}</a></li>
    {elseif is_array($url)}
        <li class="menu-item has-submenu">
            <span class="menu-label">{$label|escape}</span>
            <ul class="submenu">
                {foreach item=subUrl key=subLabel from=$url}
                    {menuItem label=$subLabel url=$subUrl}
                {/foreach}
            </ul>
        </li>
    {elseif $label}
        <li class="menu-item"><span class="menu-label">{$label|escape}</span></li>
    {/if}
{/template}

<nav class="slate-menu">
<ul class="menu">{strip}

{if $.User}
    <li class="menu-item">
        <a class="menu-label" href="#">Classes</a>
        <ul class="submenu">
        {foreach item=Section from=$.User->CurrentCourseSections}
            <li class="menu-item {if RemoteSystems\Canvas::$canvasHost}has-submenu{/if}">
                {if RemoteSystems\Canvas::$canvasHost}
                    <span class="menu-label">
                        {if $Section->Schedule->Title}{$Section->Schedule->Title|escape}: {/if}
                        {$Section->Title|escape}
                    </span>
                {else}
                    <a class="menu-label" href="/sections/{$Section->Handle}">
                        {if $Section->Schedule->Title}{$Section->Schedule->Title|escape}: {/if}
                        {$Section->Title|escape}
                    </a>
                {/if}

                {if RemoteSystems\Canvas::$canvasHost && $Section->Mappings}
                <ul class="submenu">
                    <li class="menu-item"><a class="menu-label" href="/sections/{$Section->Handle}">Slate</a></li>
                    {foreach item=Mapping from=$Section->Mappings}
                        {if $Mapping->ExternalSource == 'CanvasIntegrator' && $Mapping->ExternalKey == 'course[id]'}
                            {*<li class="menu-subitem"><a href="/cas/login?service={urlencode('http://moodle.scienceleadership.org/course/view.php?id=')}{$Mapping->ExternalIdentifier}">Moodle</a></li>*}
                            <li class="menu-item"><a class="menu-label" target="_blank" href="{RemoteSystems\Canvas::$canvasHost}/courses/{$Mapping->ExternalIdentifier}">Canvas</a></li>
                        {/if}
                    {/foreach}
                </ul>
                {/if}
            </li>
        {foreachelse}
            <li class="empty menu-item"><em class="menu-label">None this term</em></li>
        {/foreach}
        </ul>
    </li>
{/if}

{$infoTag = Tag::getByHandle('site_info')}

{if $infoTag}
    {$infoPages = $infoTag->getItemsByClass('Emergence\CMS\Page', array(conditions = array(Class='Emergence\CMS\Page',Status=Published,Visibility=Public,'Published IS NULL OR Published <= CURRENT_TIMESTAMP')))}

    {if count($infoPages)}
    <li class="menu-item">
        <span class="menu-label">Info</span>
        <ul class="submenu">
            {foreach item=infoPage from=$infoPages}
                {menuItem label=$infoPage->Title url="/pages/$infoPage->Handle"}
            {/foreach}
        </ul>
    </li>
    {/if}
{/if}

{$manageTools = Slate::$manageTools}
{$webTools = Slate::$webTools}
<li class="menu-item">
    <span class="menu-label">Tools</span>
    <ul class="submenu">
        {if $.User->hasAccountLevel('Staff')}
            <li class="menu-item has-submenu">
                <a class="menu-label" href="/manage">Manage Slate</a>
                <ul class="submenu">
                    {foreach item=url key=label from=$manageTools}
                        {menuItem label=$label url=$url}
                    {/foreach}
                </ul>
            </li>
        {/if}

        {foreach item=url key=label from=$webTools}
            {menuItem label=$label url=$url}
        {/foreach}
    </ul>
</li>

<li class="menu-item">
    {if $.User}
        <span class="menu-label">Me</span>
        <ul class="submenu">
            <li class="menu-item"><a class="menu-label" href="/people/{$.User->Username}">My Profile</a></li>
            <li class="menu-item"><a class="menu-label" href="/profile">Edit Profile</a></li>
            <li class="menu-item"><a class="menu-label" href="/drafts">My Drafts</a></li>
            <li class="menu-item"><a class="menu-label" href="/logout">Log Out</a></li>
        </ul>
    {else}
        <a class="menu-label" href="/login?return={$.server.REQUEST_URI|escape:url}">Log In</a>
    {/if}
</li>

{/strip}</ul>
</nav>