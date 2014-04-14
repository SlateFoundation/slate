/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext*/
Ext.define('BlogEditor.model.BlogPost', {
	extend: 'Ext.data.Model'
	,idProperty: 'ID'
	,fields: [
		{name: 'ID', type: 'int'}
		,{name: 'Title'} 
		,{name: 'AuthorID'}
		,{name: 'Status'}
		,{name: 'Receipt'}
		,{name: 'Status'}	
		,{name: 'Published', type: 'date' ,dateFormat: 'timestamp'}
		,{name: 'Visibility'}
		,{name: 'Items'}
		,{name: 'Visibility'}
		,{name: 'Items'}
		,{name: 'Author'}
		,{name: 'tags', convert: function(v,r){
			debugger;
			
			console.log(r);
		}}
		,{name: 'Author'}
//		
	]
//	,validations: [
//		{type: 'presence', field: 'FirstName' }
//		,{type: 'presence', field: 'LastName' }
//		,{type: 'presence', field: 'StartDate' }
//		,{type: 'presence', field: 'EndDate' }
//		,{type: 'presence', field: 'Username' }
//	]
	,proxy: {
		type: 'ajax'
		,api: {
			read: '/blog/json/testing_mp4/'
//			,create: '/blog/json/save'
//			,update: '/blog/json/save'
//			,destroy: '/blog/json/destroy'
		}
		,reader: {
			type: 'json'
			,root: 'data'
		}
		,writer:{
			type: 'json'
			,root: 'data'
			,writeAllFields: false
			,allowSingle: false
		}
	}
});