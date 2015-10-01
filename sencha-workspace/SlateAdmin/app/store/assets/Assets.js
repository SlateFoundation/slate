/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.Assets',{
	extend: 'Ext.data.Store'
	,requires: ['SlateAdmin.model.asset.Asset']

	,model: 'SlateAdmin.model.asset.Asset'
    ,storeId: 'assets.Assets'
	,autoLoad: false
	,buffered: true
	,pageSize: 50
	,remoteSort: true
});