{load_templates subtemplates/personName.tpl}

{template avatar Person size=32 pixelRatio=2 urlOnly=false forceSquare=true imgCls=no}{strip}
    {$pixels = $size * $pixelRatio}

    {if $Person->PrimaryPhoto}
        {$src = $Person->PrimaryPhoto->getThumbnailRequest($pixels, $pixels, null, $forceSquare)}
    {else}
        {$src = cat("//www.gravatar.com/avatar/", md5(strtolower($Person->Email)), "?s=", $pixels, "&r=g&d=mm")}
    {/if}

    {if $urlOnly}
        {$src}
    {else}
        <img height="{$size}" width="{$size}" alt="{personName $Person}" src="{$src}" class="avatar" {if $imgCls}class="{$imgCls}"{/if}>
    {/if}
{/strip}{/template}

{template personLink Person photo=no photoSize=64 pixelRatio=2 linkCls=no imgCls=no nameCls=no summary=no}{strip}
    {if $Person}
        <a href="{$Person->getURL()}" title="{personName $Person summary=yes}" {if $linkCls}class="{$linkCls}"{/if}>
            {if $photo}
                {$pixels = $photoSize}
                {if $pixelRatio}
                    {$pixels = $photoSize * $pixelRatio}
                {/if}
                {if $Person->PrimaryPhoto}
                    {$src = $Person->PrimaryPhoto->getThumbnailRequest($pixels, $pixels)}
                {else}
                    {$src = cat("//www.gravatar.com/avatar/", md5(strtolower($Person->Email)), "?s=", $pixels, "&r=g&d=mm")}
                {/if}
                <div class="avatar" style="width:{$photoSize}px;height:{$photoSize}px;background-image:url({$src})" {if $imgCls}class="{$imgCls}"{/if}></div>
            {/if}
            <span class="name {$imgCls}">{personName $Person summary=$summary}</span>
        </a>
    {else}
        <em class="anonymous">Anonymous</em>
    {/if}
{/strip}{/template}