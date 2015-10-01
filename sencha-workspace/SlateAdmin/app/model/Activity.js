/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.Activity',{
	extend: 'Ext.data.Model'

	,fields: [
		'ID'
		,'Class'
		,'Verb'
		,'Actor'
		,'ActorClass'
		,'ObjectClass'
		,{
			name: 'ActorID'
			,type: 'integer'
		}
		,{
			name: 'ObjectID'
			,type: 'integer'
		}
		,{
			name: 'ID'
			,type: 'integer'
		}
		,{
			name: 'Creator'
			,type: 'integer'
		}
		,{
			name: 'Created'
			,type: 'date'
			,dateFormat: 'timestamp'
		}
		,{
			name: 'Data'
		}
	]
	,classShortNames: {
		'RepmanTicket': 'Ticket'
	}
	,idProperty : 'ID'
});
