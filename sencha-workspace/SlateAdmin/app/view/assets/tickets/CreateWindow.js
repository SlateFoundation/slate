/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.CreateWindow', {
	extend: 'Ext.window.Window'
	,alias: 'widget.assets-tickets-createwindow'

	,title: 'Ticket Create Window'
	,centered: true
	,modal: true
	,height: 300
	,width: 300
    ,items: [{
		xtype: 'form'
		,defaults: {
		    labelAlign: 'top'
		    ,labelSeparator: ''
		    ,anchor: '100%'
		}
		,items: [{
			xtype: 'combo'
			,flex: 1
			,selectOnFocus: true
			,name: 'AssetID'
			,minChars: 2
			,autoSelect: false
			,forceSelection: true
			,hideTrigger: true
			,fieldLabel: 'Assigned Asset'
			,emptyText: 'Select an Asset'
			,store: {
				model: 'Slate.model.Asset'
			}
			,mode: 'remote'
			,displayField: 'SearchDisplayName'
			,valueField: 'ID'
			,queryParam: 'q'
			,lazyRender: 'true'
			,allowBlank: false
			,blankText: 'Select name, serial, location, or status'
		},{
			xtype: 'combo'
			,selectOnFocus: true
			,name: 'TechID'
			,autoSelect: false
			,hideTrigger: true
			,allowBlank: true
			,fieldLabel: 'Assigned Tech'
			,emptyText: 'First and Last name'
			,store: {
				model: 'Slate.model.Person'
			}
			,queryMode: 'remote'
			,displayField: 'FullName'
			,valueField: 'ID'
			,queryParam: 'q'
			,lazyRender: 'true'
			,blankText: 'Select or type the full name of the tech'

		},{
			xtype: 'textareafield'
			,name: 'Description'
			,allowBlank: false
			,fieldLabel: 'Description'
		},{
			xtype: 'combo'
			,displayField: 'name'
			,name: 'Type'
			,fieldLabel: 'Type'
			,allowBlank: false
			,store: {
				fields: ['name']
				,data: [
					{name: 'Repair'}
					,{name: 'Quarantine'}
					,{name: 'Image'}
					,{name: 'Other'}
				]
			}
		},{
			xtype: 'button'
			,text: 'Submit'
			,action: 'submit-ticket'
		}]
    }]
});
