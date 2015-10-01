/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.locations.Manager',{
	extend: 'Ext.tree.Panel'
	,xtype: 'assets-locations-manager'

	,stateful: true
	,stateId: 'asset-location-manager'
	,store: 'assets.Locations'
	,emptyText: 'No assets locations found.'
	,useArrows: true
	,rootVisible: false
	,selModel: {
		pruneRemoved: false
	}
	,tbar: [{
		xtype: 'button'
		,text: 'Add Location'
		,action: 'add-location'
	},{
		xtype: 'tbfill'
	},{
		xtype: 'tbtext'
		,width: 200
		,text: 'Right Click to add a child or delete a record'
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
					{name: 'Live'}
					,{name: 'Deleted'}
					,{name: 'Hidden'}
				]
			}
		}
	}]
	,plugins: [{
		ptype: 'cellediting'
	}]
});
