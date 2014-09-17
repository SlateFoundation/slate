<h1 class="site-branding has-slogan">
    <a href="/">
        {if Site::resolvePath('site-root/img/logo.png')}
            <img class="site-logo" src="{versioned_url 'img/logo.png'}" height=80 alt="{Slate::$schoolName|escape}">
        {elseif Site::resolvePath('site-root/apple-touch-icon.png')}
            <img class="site-icon" src="{versioned_url '/apple-touch-icon.png'}" width=36 alt="{Slate::$schoolName|escape}">
        {/if}
        <div class="text">
            <big class="site-name">{Slate::$schoolName|escape}</big>
        {if Slate::$siteSlogan}
            <small class="site-slogan">{Slate::$siteSlogan|escape}</small>
        {/if}
        </div>
    </a>
</h1>