/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.AssetStatuses',{
	extend: 'Ext.data.Store'
	,requires: [
        'SlateAdmin.model.asset.Status',
        'SlateAdmin.proxy.Records'
    ]
	,model: 'SlateAdmin.model.asset.Status'
	,proxy: {
		type: 'slaterecords'
		,url: '/assets/json/statuses'
		,reader: {
			type: 'json'
			,root: 'data'
		}
		,extraParams: {
			parentStatus: 'all'
		}
	}
});
