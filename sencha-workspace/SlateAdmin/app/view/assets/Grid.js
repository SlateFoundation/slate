/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.Grid',{
	extend: 'Ext.grid.Panel'
	,xtype: 'assets-grid'
	,requires: [
		'Ext.selection.CheckboxModel'
	]
	,stateful: true
	,stateId: 'assets-grid'
	,store: 'assets.Assets'
	,emptyText: 'No assets found.'
	,selType: 'checkboxmodel'
	,multiSelect: true
	,selModel: {
		pruneRemoved: false
	}
	,bbar: [{
		xtype: 'tbtext'
		,itemId: 'selectionCount'
		,text: ''
	},{
		xtype: 'tbfill'
    },{
		xtype: 'tbtext'
		,bulkOnly: true
		,disabled: true
		,text: 'Bulk actions:'
	},{
		xtype: 'button'
		,bulkOnly: true
		,disabled: true
		,text: 'Set status'
		,action: 'bulk-edit'
		,store: 'AssetStatuses'
		,bulkField: 'StatusID'
		,icon: '/img/icons/fugue/thermometer.png'
		,menu: {
			plain: true
			,itemId: 'statusMenu'
			,items: []
		}
	},{
		xtype: 'button'
		,bulkOnly: true
		,disabled: true
		,text: 'Set location'
		,action: 'bulk-edit'
		,bulkField: 'LocationID'
		,store: 'AssetLocations'
		,icon: '/img/icons/fugue/geolocation.png'
		,menu: {
			plain: true
			,itemId: 'locationMenu'
			,items:[]
		}
//	},'->'
//	,{
//        xtype: 'pagingtoolbar'
//		,store: 'Assets'   // same store GridPanel is using
//        ,displayInfo: true
    }]
	,columns: [{
		header: 'Serial'
		,dataIndex: 'MfrSerial'
		,width : 120
		,emptyCellText: '&mdash;'
	},{
		header: 'MAC'
		,dataIndex: 'MacAddress'
		,width : 130
		,emptyCellText: '&mdash;'
	},{
		xtype: 'templatecolumn'
		,header: 'Assignee'
		,dataIndex: 'Assignee'
		,width : 150
		,tpl: '{AssigneeName}'
	},{
		header: 'Status'
		,dataIndex: 'Status'
		,flex: 1
		,renderer: function (v,m,r) {
			return v ? v.Title : '&mdash;';
		}
	},{
		header: 'Location'
		,dataIndex: 'Location'
		,flex: 1
		,renderer: function (v,m,r) {
			return v ? v.Title : '&mdash;';
		}
	},{
		header: 'Manufacturer'
		,dataIndex: 'Manufacturer'
		,width: 100
		,emptyCellText: '&mdash;'
		,hidden: true
		,sortable: false
	},{
		header: 'Model'
		,dataIndex: 'Model'
		,width: 150
		,emptyCellText: '&mdash;'
		,hidden: true
		,sortable: false
	},{
		xtype: 'templatecolumn'
		,header: 'Owner'
		,dataIndex: 'Owner'
		,width : 150
		,tpl: '{OwnerName}'
		,hidden: true
	}]

});
