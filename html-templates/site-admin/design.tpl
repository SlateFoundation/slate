<!DOCTYPE html>

{template icon name}<i class="fa fa-{$name}" aria-hidden="true"></i>{/template}

<html lang="en">
    <head>
        {block meta}
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" href="/img/emergence/favicon.ico">
        {/block}

        <title>{block title}{Site::getConfig(handle)}{/block}</title>

        {block css}
            {cssmin "lib/bootstrap.css+site-admin.css"}
            {cssmin "fonts/font-awesome.css"}
        {/block}
    </head>

    <body>
        {block nav}
            {if $.task && !$activeSection}
                {$activeSection = tasks}
            {/if}

            <nav class="navbar navbar-dark navbar-expand-lg fixed-top bg-dark">
                <div class="container">
                    <a class="navbar-brand" href="/site-admin"><img src="{versioned_url img/emergence/logo.png}" height="32"> Emergence Site Administrator</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mr-auto">
                            {foreach item=item key=key from=Emergence\SiteAdmin\Navigation::getItems()}
                                <li class="nav-item {tif $activeSection == $key ? active}">
                                    <a class="nav-link" href="{$item.url|escape}">
                                        {$item.label|escape}

                                        {if $item.badge}
                                            <span class="badge badge-primary">{$item.badge|number_format}</span>
                                        {/if}
                                    </a>
                                </li>
                            {/foreach}
                        </ul>
{*
                        <ul class="nav navbar-nav navbar-right">
                            <li><a href="#">Load Average</a></li>
                            {$CPULoad = sys_getloadavg()}
                            <li class="active {if $CPULoad.0>1}load-yellow{else if $CPULoad.0>4}load-red{else}load-green{/if}"><a href="#">{$CPULoad.0}<sub>1</sub></a></li>
                            <li class="active {if $CPULoad.0>1}load-yellow{else if $CPULoad.0>4}load-red{else}load-green{/if}"><a href="#">{$CPULoad.1}<sub>5</sub></a></li>
                            <li class="active {if $CPULoad.0>1}load-yellow{else if $CPULoad.0>4}load-red{else}load-green{/if}"><a href="#">{$CPULoad.2}<sub>15</sub></a></li>
                        </ul>
*}
                    </div>
                </div>
            </nav>
        {/block}

        <main role="main" class="container">
            {strip}
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    {block breadcrumbs}
                        {if $.task}
                            <li class="breadcrumb-item"><a href="/site-admin/tasks">Tasks</a></li>
                            <li class="breadcrumb-item active">
                                {icon $task.icon}
                                &nbsp;
                                {$.task.title|escape}
                            </li>
                        {/if}
                    {/block}
                </ol>
            </nav>
            {/strip}

            {block content}{/block}
        </div>

        {block js-bottom}
            {jsmin "lib/jquery.js+lib/popper.js+lib/bootstrap.js"}
        {/block}
  </body>
</html>
