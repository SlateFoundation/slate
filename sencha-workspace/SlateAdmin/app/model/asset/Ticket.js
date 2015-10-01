/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.asset.Ticket',{
	extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

	fields: [
		'Asset'
		,'Status'
		,'Tech'
		,'Serial'
		,'Type'
		,{
			name: 'ID'
			,type: 'int'

		}
		,{
			name: 'AssetID'
			,type: 'int'
		}
		,{
			name: 'AssigneeName'
			,convert: function(v,r) {
				var asset = r.get('Asset');

				if(!asset || !asset.Assignee) {
					return '';
				}
				return asset.Assignee.FirstName + " " + asset.Assignee.LastName;
			}

		}
		,{
			name: 'Created'
			,type: 'date'
			,dateFormat: 'timestamp'
		}
		,{
			name: 'TechID'
			,type: 'integer'
		}
		,{
			name: 'TechName'
			,convert: function(v,r) {
				var tech = r.get('Tech');

				if(!tech)
					return '';

				return (tech.FirstName && tech.LastName) ? tech.FirstName + " " + tech.LastName : '';
			}
		}
		,{
			name: 'FirstNote'
			,convert: function(v,r) {
				if(v)
					return v.Data;
			}
		}
	]
	,idProperty : 'ID'
	,proxy: {
		type: 'slaterecords'
        ,url: '/tickets'
		,limitParam: 'limit'
		,startParam: 'offset'
		,reader: {
			type: 'json'
			,root: 'data'
		}
		,writer: {
			type: 'json'
			,root: 'data'
			,allowSingle: false
			,writeAllFields: false
		}
	}
});
