/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.asset.ticket.Editor', {
	extend: 'Ext.app.Controller'
	
    ,views: [
        'assets.tickets.details.Editor'
    ]
    ,refs: [{
        ref: 'assetTicketsManager'
        ,selector: 'assets-tickets-manager'
        ,xtype: 'assets-manager'
	},{
		ref: 'assetTicketEditor'
		,selector: 'assets-tickets-details-editor'
		,xtype: 'assets-tickets-details-editor'
	}]
	,init: function() {
		var me = this;
		
		me.control({
			'assets-tickets-details-editor button[action=saveTicket]':{
				click: me.saveTicket
            }
            ,'assets-tickets-details-editor':{
				activate: {fn:me.onEditorActivate, delay: 10}
            }
		});
		
		me.application.on('assetticketselected', me.loadTicket, me);
	}
	
	
	//event handlers
	,onEditorActivate: function(){
		var ticket = this.getAssetTicketsManager().getTicket();
		
		if(ticket) {
			this.loadTicket(ticket);
		}
	}
	
	
	//helper functions
	,loadTicket: function(ticket){
		
		var form = this.getAssetTicketEditor();
	
		form.getForm().loadRecord(ticket);
		
		form.enable();
	}
	
	,saveTicket: function(){
		
		var form = this.getAssetTicketEditor()
			,values = form.getValues(false, true)
			,ticket = form.getRecord()
			,manager = this.getAssetTicketsManager()
			,oldTicket = manager.getTicket();
		
		form.setLoading({
			xtype: 'loadmask'
			,message: 'Saving&hellip;'
		});
		
		ticket.beginEdit();		
		Ext.Object.each(values, function(key, value, object){
			switch(key){
				case 'Serial':
					if(oldTicket && oldTicket.get('Serial') != form.down('combo[name=Serial]').getValue())
						ticket.set('AssetID', value);
						
					break;
					
				case 'AssigneeName':
					if(oldTicket && oldTicket.get('TechName') != form.down('combo[name=TechName]').getValue())
						ticket.set('AssetID', value);
						
					break;
				
				case 'TechName':
					if(oldTicket && oldTicket.get('TechName') != form.down('combo[name=TechName]').getValue())
						ticket.set('TechID', value);
					break;
				
				default:
					ticket.set(key, value);
			}
		});
		ticket.endEdit();
		
		ticket.save({
			success: function(record){
				manager.updateTicket(record);
				form.setLoading(false);
			}
			,failure: function() {
				form.setLoading(false);
			}
		});
	}
});