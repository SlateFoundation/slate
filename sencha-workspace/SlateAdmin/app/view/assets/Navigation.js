/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.Navigation',{
	extend: 'Ext.Panel'
	,xtype: 'assets-navpanel'
	,requires: [
		'Ext.form.Panel'
		,'Ext.form.FieldSet'
		,'Ext.form.field.Text'
		,'Ext.Button'
	]

	,title: 'Assets'
	,layout: {
		type: 'vbox'
		,align: 'stretch'
	}
	,items: [{
		xtype: 'form'
		,cls: 'navpanel-search-form'
		,itemId: 'search-form'
		,items: [{
			xtype: 'textfield'
			,anchor: "100%"
			,itemId: 'searchField'
			,inputType: 'search'
			,emptyText: 'Search All Assets'
			,selectOnFocus: true
		}]
	},{
		xtype: 'panel'
		,flex: 1
		,html: ''
			+'<ul class="slate-nav-list">'
				+'<li><a href="#assets">Browse All Assets</a></li>'
				+'<li><a href="#assets/tickets">Browse Tickets</a></li>'
				+'<li><a href="#assets/statuses">Browse Statuses</a></li>'
				+'<li><a href="#assets/locations">Browse Locations</a></li>'
//				+'<li><a href="#assets/importer">Import Assets</a></li>'
			+'</ul>'
	},{
		xtype: 'form'
		,itemId: 'create-form'
		,items: {
			xtype: 'fieldset'
			,title: 'Add New Asset'
			,defaults: {
				labelAlign: 'top'
			}
			,items: [{
				xtype: 'textfield'
				,name: 'Name'
				,fieldLabel: 'Nickname'
				,emptyText: 'Optional...'
				,selectOnFocus: true
			},{
				xtype: 'textfield'
				,name: 'MfrSerial'
				,fieldLabel: 'Mfr Serial'
			},{
				xtype: 'button'
				,text: 'Create'
				,action: 'create'
			}]
		}
	}]
});
