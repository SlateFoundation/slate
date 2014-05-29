<h1 class="branding">
    <a href="/">
        {if Site::getVersionedRootUrl('img/logo.png')}
            <img class="logo" src="{Site::getVersionedRootUrl('img/logo.png')}" height=80 alt="">
        {/if}
        <div class="text">
            <big class="school-name">{Slate::$schoolName}</big>
        {if Slate::$siteSlogan}
            <small class="school-slogan">{Slate::$siteSlogan}</small>
        {/if}
        </div>
    </a>
</h1>