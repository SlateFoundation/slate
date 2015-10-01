/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.Manager',{
	extend: 'Ext.container.Container'
	,alias: 'widget.assets-manager'
	,requires: [
		'Ext.tab.Panel'
		,'SlateAdmin.view.assets.Grid'
		,'SlateAdmin.view.assets.Header'
		,'SlateAdmin.view.assets.details.Editor'
		// ,'SlateAdmin.view.assets.details.Tickets'
		,'SlateAdmin.view.assets.details.Events'
	]

	,layout: {
		type: 'hbox'
		,align: 'stretch'
	}
	,config: {
        asset: null
    }
	,items: [{
		xtype: 'assets-grid'
		,flex: 1
	},{
		xtype: 'panel'
		,layout: {
			type: 'vbox'
			,align: 'stretch'
		}
		,width: 400
		,items: [{
			xtype: 'assets-header'
			,height: 100
		},{
			xtype: 'tabpanel'
			,flex: 1
			,itemId: 'profileTabs'
			,tabBar: {
				ui: 'plain'
				,defaults: {
					flex: 1
				}
            }
            ,items: [{
				xtype: 'assets-details-editor'
				,disabled: true
            },{
			// 	xtype: 'assets-details-tickets'
			// 	,disabled: true
            // },{
				xtype: 'assets-details-events'
				,disabled: true
            }]
		}]
	}]


	//helper functions
	,updateAsset: function(asset){
		var header = this.down('assets-header');

		header.update(asset.getData());
	}
	,updateData: function(data){
		var tab = this.add ({data: data, title: data.ID, tpl: this.tpl});
		//tab.getForm().loadRecord(data);
		this.setActiveTab(tab);
	}

});
