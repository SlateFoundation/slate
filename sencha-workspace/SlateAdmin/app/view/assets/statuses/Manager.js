/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.statuses.Manager',{
	extend: 'Ext.tree.Panel'
	,xtype: 'assets-statuses-manager'

	,stateful: true
	,stateId: 'asset-status-manager'
	,store: 'assets.Statuses'
	,emptyText: 'No assets statuses found.'
	,useArrows: true
	,rootVisible: false
	,selModel: {
		pruneRemoved: false
	}
	,tbar: [{
		xtype: 'button'
		,text: 'Add Status'
		,action: 'add-status'
	},{
		xtype: 'tbfill'
	},{
		xtype: 'tbtext'
		,text: 'Right click a record to add a child or delete a record'
	}]
	,columns: [{
		xtype: 'treecolumn'
		,dataIndex: 'Title'
		,flex : 1
		,header: 'Title'
		,emptyCellText: '&mdash;'
		,editor: {
			xtype: 'textfield'
		}
	},{
		header: 'Status'
		,dataIndex: 'Status'
		,width : 130
		,emptyCellText: '&mdash;'
		,editor: {
			xtype: 'combo'
//			,valueField: 'name'
			,displayField: 'name'
			,store: {
				fields: ['name']
				,data: [
					{name: 'Active'}
					,{name: 'Disabled'}
				]
			}
		}
	}]
	,plugins: [{
		ptype: 'cellediting'
	}]
});
