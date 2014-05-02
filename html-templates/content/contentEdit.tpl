{extends designs/site.tpl}

{block "css"}
    {$dwoo.parent}

	<link rel="stylesheet" type="text/css" href="{Sencha::getVersionedFrameworkPath('ext', 'resources/ext-theme-classic/ext-theme-classic-all.css')}" />

	{cssmin "slate-frontend.x-reset.css"}

	<link rel="stylesheet" href="{Sencha::getVersionedLibraryPath('ExtUx/form/field/BoxSelect.css')}">
	<link rel="stylesheet" href="{Sencha::getVersionedLibraryPath('ExtUx/portal/portal.css')}">
	<link rel="stylesheet" href="{Sencha::getVersionedLibraryPath('Emergence/cms/view/EditorPanel.css')}">
{/block}

{block js-bottom}
	<script type ="text/javascript" src="/jslib/SWFUpload/swfupload.js"></script>

	<script type="text/javascript">
		window.SiteUser = {$.User->getData()|json_encode};
		window.ContentData = {tif $data ? JSON::translateObjects($data->getDetails(array('tags','items')))|json_encode : 'null'};
	</script>

	{$dwoo.parent}

	{if $.get.jsdebug}
		<script>
			Ext.require('Site.page.ContentEditor');
		</script>
	{else}
		<script src="{Site::getVersionedRootUrl('js/pages/ContentEditor.js')}"></script>
	{/if}
{/block}

{block content}{/block}