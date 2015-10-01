/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.AssetLocations',{
	extend: 'Ext.data.Store'
	,requires: [
		'SlateAdmin.model.Location'
		,'Emergence.proxy.Records'
	]

	,model: 'SlateAdmin.model.Location'

	,proxy: {
		type: 'records'
		,url: '/locations'
		,extraParams: {
			Class: 'AssetLocation'
			,parentLocation: 'all'
		}
	}
});
