/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.asset.Tickets', {
	extend: 'Ext.app.Controller'
    ,views: [
        'assets.details.Tickets'
        ,'assets.tickets.CreateWindow'
    ]
    ,stores: [
		'assets.details.Tickets'	
    ]
    ,refs: [{
        ref: 'assetsManager'
        ,selector: 'assets-manager'
        ,xtype: 'assets-manager'
	},{
		ref: 'assetTicketsPanel'
		,selector: 'assets-details-tickets'
		,xtype: 'assets-details-tickets'
	},{
		ref: 'assetTicketList'
		,selector: 'assets-details-tickets #ticketList'
	},{
		ref: 'assetTicketCreateWindow'
		,autoCreate: true
		,selector: 'assets-tickets-createwindow'
		,xtype: 'assets-tickets-createwindow'
	}]	
	,init: function() {
		var me = this;
		
		me.control({
            'assets-details-tickets':{
				activate: {fn:me.onEditorActivate, delay: 10}
            }
            ,'assets-details-tickets #ticketList': {
				itemdblclick: me.onTicketDoubleClick
            }
            ,'assets-details-tickets button[action=addTicket]': {
				click: me.onAddTicket
			}
		});
		
		me.application.on('assetselected', me.onAssetSelected, me);
		me.application.on('assetticketcreated', me.onAssetTicketCreated, me);
	}
	
	
	//event handlers
	,onEditorActivate: function(){
		var asset = this.getAssetsManager().getAsset();
		
		if(asset){
			this.loadAsset(asset);
		}
	}
	
	,onAddTicket: function(){
		
		var ticketCreateWindow = this.getAssetTicketCreateWindow()
			,assetCombo = ticketCreateWindow.down('form').down('combo[name=AssetID]')
			,asset = this.getAssetsManager().getAsset();
		
		assetCombo.hide();
		assetCombo.setValue(asset.get('ID'));
//		console.log(assetCombo);
		ticketCreateWindow.show();
		
		assetCombo.getStore().on('load', function(store, records, success){
			assetCombo.select(asset.get('ID'));
			assetCombo.collapse();
		},this,{single: true});
		
		assetCombo.doQuery(asset.get('MfrSerial'), false, true);
	}
	
	,onAssetSelected: function(asset) {
		var activeProfileView = this.getAssetsManager().down('#profileTabs').getActiveTab()
			,activeXtype = activeProfileView.xtype
			,ticketsView = this.getAssetTicketsPanel();
		
		ticketsView.enable();
//		ticketsView.setLoaded(false);
		
		if(activeXtype == ticketsView.xtype)
		{
			this.loadAsset(asset);
		}
	}
	
	,onAssetTicketCreated: function(ticket){
		
		var store = Ext.getStore('assets.details.Tickets');
		
		if(!store.isLoading()) {
			store.load({
				url: '/assets/json/' + ticket.get('AssetID') + '/tickets'
			});
		}
	}
	
	,onTicketDoubleClick: function(view, record){
		Ext.util.History.add('assets/tickets/' + record.get('ID'));
	}
	
	
	//helper functions
	,loadAsset: function(asset){	
		var view = this.getAssetTicketsPanel()
			,list = view.down('#ticketList')
			,store = list.getStore();
	
		view.enable();
		
		if(!store.isLoading() && view.isVisible()) {
			store.load({
				url: '/assets/json/' + asset.get('ID') + '/tickets'
			});
		}
	}
});
