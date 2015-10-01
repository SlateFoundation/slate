/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.Locations', {
	extend: 'Ext.data.TreeStore'
	,requires: [
		'SlateAdmin.model.Location'
	]

	,storeId: 'assets.Locations'
	,model: 'SlateAdmin.model.Location'
	,nodeParam: 'parentLocation'
	,autoSync: true
	,pageSize: false
	,root: {
		ID: null
		,expanded: true
	}
	,proxy: {
		type: 'ajax'
		,api: {
			read: '/locations/json'
			,create: '/locations/json/save'
			,update: '/locations/json/save'
			,destroy: '/locations/json/destroy'
		}
		,extraParams: {
			Class: 'AssetLocation'
		}
		,reader: {
			type: 'json'
			,root: 'data'
			,totalProperty: 'total'
		}
		,writer:{
			type: 'json'
			,root: 'data'
			,writeAllFields: false
			,allowSingle: false
		}
	}
});