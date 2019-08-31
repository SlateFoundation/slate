<!DOCTYPE html>
{block "before-all"}{/block}
<html>
    <head>
        {block "meta"}
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

            <title>{if $title}{$title}{else}{$app->getName()}{/if}</title>
        {/block}

        {block "css-head"}{/block}

        {block "css-app"}
            {$app->buildCssMarkup()}
        {/block}
    </head>

    <body class="{block "body-class"}loading{/block}">
        {block "body"}{/block}

        {block "js-data"}
            {$app->buildDataMarkup()}
        {/block}

        {block "js-app"}
            {$app->buildJsMarkup()}
        {/block}

        {block "js-analytics"}
            {include "includes/site.analytics.tpl"}
        {/block}
    </body>
</html>