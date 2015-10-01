/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.asset.Status',{
	extend: 'Ext.data.Model'
	,requires: [
		'Emergence.proxy.Records'
	]

	,fields: [
		'Title'
		,'Handle'
		,'Status'
		,{
		name: 'ID'
		,type: 'int'
	},{
		name: 'Class'
		,type: 'string'
	},{
		name: 'Created'
		,type: 'date'
		,dateFormat: 'timestamp'
	},{
		name: 'CreatorID'
		,type: 'int'
	},{
		name: 'ParentID'
		,type: 'int'
	},{
		name: 'Left'
		,type: 'int'
	},{
		name: 'Right'
		,type: 'int'
	},{
		name: 'text'
		,type: 'string'
		,convert: function(v, r) {
			return v || r.get('Title');
		}
	},{
		name: 'leaf'
		,type: 'boolean'
		,convert: function(v, r) {
			if(typeof v == 'boolean')
				return v;
			else
				return r.get('Left') == r.get('Right')-1;
		}
	}]
	,idProperty: 'ID'
	,proxy: {
		type: 'records'
		,url: '/asset_statuses/json'
        ,reader: {
    		type: 'json'
			,root: 'data'
		}
	}
});
