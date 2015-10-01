/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.Activity',{
	extend: 'Ext.data.Store'

	,requires: [
        'SlateAdmin.model.Activity',
        'Emergence.proxy.Records'
    ]
	,model: 'SlateAdmin.model.Activity'
	,sorters: [{
		property: 'Created'
		,direction: 'DESC'
	}]
	,proxy: {
		type: 'records'
		,url: '/activity/json'
		,simpleSortMode: true
	}
});
