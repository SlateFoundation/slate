/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.Statuses', {
	extend: 'Ext.data.TreeStore'
	,requires: [
		'SlateAdmin.model.asset.Status'
	]

	,storeId: 'assets.Statuses'
	,model: 'SlateAdmin.model.asset.Status'
	,nodeParam: 'parentStatus'
	,autoSync: true
//	,autoLoad: false
	,pageSize: false
	,root: {
		ID: null
		,expanded: true
	}
});