{extends designs/site.tpl}

{block "css"}
    {cssmin fonts/font-awesome.css}
    <link rel="stylesheet" type="text/css" href="{Sencha_App::getByName('ContentEditor')->getVersionedPath('build/production/resources/ContentEditor-all.css')}" />

    {$dwoo.parent}
{/block}

{block js-bottom}
    <script type="text/javascript">
        var SiteEnvironment = SiteEnvironment || { };
        SiteEnvironment.user = {JSON::translateObjects($.User)|json_encode};
        SiteEnvironment.cmsContent = {tif $data ? JSON::translateObjects($data, false, 'tags,items,Author,Context.recordURL,Context.recordTitle')|json_encode : 'null'};
        SiteEnvironment.cmsComposers = ['html', 'markdown', 'multimedia', 'embed'];
        SiteEnvironment.mediaSupportedTypes = {Media::getSupportedTypes()|json_encode};
    </script>

    {$dwoo.parent}

    {if $.get.jsdebug}
        {sencha_bootstrap
            patchLoader=false
            packages=array('slate-theme','jarvus-hotfixes')
            packageRequirers=array('sencha-workspace/pages/src/page/ContentEditor.js')
        }
    {else}
        <script src="{Site::getVersionedRootUrl('js/pages/ContentEditor.js')}"></script>
    {/if}

    {jsmin "markdown.js"}

    <script>
        Ext.require('Site.page.ContentEditor');
    </script>
{/block}

{block content}
    <div id='contentEditorCt'>Loading content editor&hellip;</div>
{/block}