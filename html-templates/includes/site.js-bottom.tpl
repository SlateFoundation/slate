{if $.get.jsdebug}
    <script src="{Sencha::getVersionedFrameworkPath('ext', 'ext-all-dev.js')}"></script>
{else}
	<script src="{Site::getVersionedRootUrl('js/pages/common.js')}"></script>
{/if}

<script>
	// TODO: figure out how to properly scope CSS so this doesn't need to be done
	Ext.onReady(function() {
		Ext.getBody().removeCls(['x-body', 'x-reset']);
	});

	Ext.Loader.setPath({
		Ext: '/app/ext/src'
		,ExtUx: '/x/ExtUx'
    	,Emergence: '/x/Emergence'
    	,Jarvus: '/x/Jarvus'
		,Site: '/app/pages/src'
	});

	Ext.require('Site.Common');
</script>