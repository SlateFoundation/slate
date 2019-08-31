{extends app/ext.tpl}

{* Legacy loader for 4.1.x *}
{block js-app-devenv}
    {capture assign=frameworkPath}sdk/ext{tif $.get.frameworkBuild!=core ? '-all'}{tif $mode == 'development' && $.get.frameworkBuild != allmin ? '-dev'}.js{/capture}
    <script type="text/javascript" src="{$App->getVersionedPath($frameworkPath)}"></script>

    {sencha_preloader}

    <script type="text/javascript">
        Ext.Loader.setConfig({
            enabled: true
            ,paths: {
                'Ext': '/app/{$App->getName()}/sdk/src'
                ,'Ext.ux': '/app/{$App->getName()}/sdk/examples/ux'
            }
        });
    </script>
{/block}