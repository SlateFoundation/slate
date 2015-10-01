/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.tickets.Grid',{
	extend: 'Ext.grid.Panel'
	,alias: 'widget.assets-tickets-grid'

	,store: 'AssetTickets'
	,autoScroll: true
	,autoHeight: true
	,columnLines: true
	,tbar: [{
		xtype: 'button'
		,action: 'addTicket'
		,text: 'Add Ticket'
	}]
	,bbar: [{
        xtype: 'pagingtoolbar'
        ,store: 'AssetTickets'
        ,displayInfo: true
    }]
	,columns: [{
		header: 'Asset Owner'
		,dataIndex: 'Asset'
		,renderer: function(v,m,r) {
			if(v) {
				return	(v.Assignee && (v.Assignee.FirstName && v.Assignee.LastName)) ? (v.Assignee.FirstName + ' ' + v.Assignee.LastName) : 'No Assignee';
			}
		}
		,width: 150
	},{
		header: 'Serial'
		,dataIndex: 'Serial'
		,width: 120
	},{
		header: 'Type'
		,dataIndex: 'Type'
		,width: 75
	},{
		header: 'Status'
		,dataIndex: 'Status'
		,width: 75
	},{
		header: 'Description'
		,dataIndex: 'FirstNote'
		,flex: 1
	}]
});
