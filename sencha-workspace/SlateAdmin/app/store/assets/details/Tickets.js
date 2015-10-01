/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.assets.details.Tickets', {
	extend: 'Ext.data.Store'
	,requires: ['SlateAdmin.model.asset.Ticket']

	,model: 'SlateAdmin.model.asset.Ticket'
	,storeId: 'assets.details.Tickets'
});