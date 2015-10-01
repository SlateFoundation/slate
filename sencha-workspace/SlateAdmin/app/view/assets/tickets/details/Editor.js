/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.details.Editor',{
	extend: 'Ext.form.Panel'
	,alias: 'widget.assets-tickets-details-editor'

	,cls: 'editor-panel assets-tickets-details-editor'
	,title: 'Editor'
    ,defaults: {
	    labelAlign: 'top'
	    ,labelSeparator: ''
	    ,anchor: '100%'
    }
	,items: [{
		xtype: 'combo'
		,flex: 1
		,selectOnFocus: true
		,name: 'Serial'
		,autoSelect: true
		,emptyText: 'Serial'
		,store: {
			model: 'Slate.model.Alias'
			,pageSize: 99999
		}
		,mode: 'remote'
		,displayField: 'DisplayName'
		,valueField: 'ObjectID'
		,queryParam: 'q'
		,fieldLabel: 'Asset'
		,hideTrigger: true
		,minChars: 2
		,lazyRender: 'true'
		,allowBlank: false
		,blankText: 'Select or type serial or mac address'

	},{
		xtype: 'combo'
		,flex: 1
		,selectOnFocus: true
		,name: 'TechName'
		,autoSelect: false
		,hideTrigger: true
		,fieldLabel: 'Assigned Tech'
		,emptyText: 'First and Last name'
		,store: {
			model: 'Slate.model.Person'
		}
		,mode: 'remote'
		,displayField: 'FullName'
		,valueField: 'ID'
		,minChars: 2
		,queryParam: 'q'
		,lazyRender: 'true'
		,allowBlank: false
		,blankText: 'Select or type the full name of the tech'
	},{
		fieldLabel: 'Status'
		,xtype: 'combo'
		,store: {
			fields: ['name']
			,data: [
				{name: 'Open'}
				,{name: 'Diagnosed'}
				, {name: 'Part Ordered'}
				, {name: 'Part Needs Installing'}
				, {name: 'Closed'}]
		}
	    ,queryMode: 'local'
	    ,displayField: 'name'
	    ,name: 'Status'
	    ,emptyText: 'No Status'
	},{
		fieldLabel: 'Type'
		,xtype: 'combo'
		,store: {
			fields: ['name']
			,data: [{name: 'Repair'}, {name: 'Quarantine'}, {name: 'Image'}, {name: 'Other'}]
		}
	    ,queryMode: 'local'
	    ,displayField: 'name'
	    ,name: 'Type'
	    ,emptyText: 'No Type'
	},{
		xtype: 'button'
		,cls: 'editor-submit-btn'
		,action: 'saveTicket'
		,text: 'Save'
		,anchor: 0
	}]
});
