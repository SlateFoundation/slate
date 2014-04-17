<!DOCTYPE html>
{load_templates designs/site.subtemplates.tpl}
<html>

    <head>
        {block meta}
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        {/block}

        <title>{block "title"}{Slate::$schoolName}{/block}</title>

        {block "css"}
            {include includes/site.css.tpl}
        {/block}

        {block "js-top"}
            {include includes/site.js-top.tpl}
        {/block}
    </head>
    <body class="{block 'body-class'}{str_replace('/', '_', $.responseId)}-tpl{/block}">
        <!--[if lt IE 7]>
            <p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
        <![endif]-->

        <div class="header-ct">
            <header class="wrapper clearfix">
                <h1 class="site-title"><a href="/">
                    <img src="{Site::getVersionedRootUrl('img/logo.png')}" height="64">
                    <div class="text">
                        <big>{Slate::$schoolName}</big>
                        {if Slate::$siteSlogan}
                            <small>{Slate::$siteSlogan}</small>
                        {/if}
                    </div>
                </a></h1>

                <form class="search-form site-search" action="/search">
                    <input name="q" class="search-field" type="search" placeholder="Find something&hellip;">
                </form>

                <nav>
                    <ul class="menu">
                        {block menu}
                            {include includes/site.menu.tpl}
                        {/block}
                    </ul>
                </nav>
            </header>
        </div>

        <div class="main-ct">
            <div class="main wrapper clearfix">
                <div class="primary-content">
                    <a class="skip-link" href="#sidebar">{block "skip-link"}Skip to News &amp; Events{/block}</a>

                    {block content}{/block}
                </div>

                <aside class="sidebar">
                    <a name="sidebar"></a>

                    {block sidebar}
                        {include includes/site.sidebar.tpl}
                    {/block}
                </aside>

            </div> <!-- .main -->
        </div> <!-- .main-ct -->

        <div class="footer-ct">
            <footer class="wrapper clearfix">
                {block footer}
                    <div class="footer-primary">{include includes/site.footer.tpl}</div>
                    <small class="info-line">Powered by <a href="http://slate.is" target=_blank title="Slate, an open-source web platform for schools">Slate</a></small>
                {/block}
            </footer>
        </div>

        {* hidden login form *}
        {if !$.User}
        <div class="modal-mask" style="display:none" id="login-modal">
            <form method="post" action="/login" class="modal-dialog">
                {foreach item=value key=name from=$postVars}
                    {if is_array($value)}
                        {foreach item=subvalue key=subkey from=$value}
                        <input type="hidden" name="{$name|escape}[{$subkey|escape}]" value="{$subvalue|escape}">
                    {else}
                        <input type="hidden" name="{$name|escape}" value="{$value|escape}">
                    {/if}
                {/foreach}
                <input type="hidden" name="_LOGIN[returnMethod]" value="{refill field=_LOGIN.returnMethod default=$.server.REQUEST_METHOD}"
                <input type="hidden" name="_LOGIN[return]" value="{refill field=_LOGIN.return default=$.server.REQUEST_URI}">

                <header class="modal-header">
                    <div class="modal-close-button">&times;</div>
                    <h2 class="modal-title">Log In</h2>
                </header>

                <div class="modal-body">
                    <fieldset class="stretch">
                        {field name=_LOGIN[username] label=Username hint='You can also log in with your email address.' required=true attribs='autofocus'}
                        {field name=_LOGIN[password] label=Password hint='<a href="/register/recover">Forgot?</a>' required=true refill=false type=password}
                    </fieldset>
                </div>

                <footer class="modal-buttons">
                    <input type="submit" class="primary" value="Log In">
                </footer>
            </form>
        </div>
        {/if}

        {block "js-bottom"}
            {include includes/site.js-bottom.tpl}
        {/block}

        {block "js-analytics"}
            {include includes/site.analytics.tpl}
        {/block}

        {* enables site developers to dump the internal session log here by setting ?log_report=1 on any page *}
        {log_report}
    </body>
</html>