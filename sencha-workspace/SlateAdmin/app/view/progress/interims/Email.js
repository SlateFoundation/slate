/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.Email', {
	extend: 'Ext.window.Window'
	,xtype: 'progress-interims-email'
	
	,height: 200
	,width: 300
	,modal: true
	,title: 'Choose Recipients'
	,layout: {
		type: 'vbox'
		,align: 'stretch'
	}
	,bbar: [{
		xtype: 'tbfill'
	},{
		xtype: 'button'
		,text: 'Preview'
		,action: 'interim-email-preview'
		,width: 75
	},{
		xtype: 'button'
		,text: 'Send'
		,action: 'interim-email-send'
		,width: 75
	}]
	,items: [{
		xtype: 'checkboxgroup'
		,fieldLabel: 'Recipients'
		,height: 100
		,vertical: true
		,items: [{
			boxLabel: 'Advisor'
			,inputValue: 'Advisor'
			,checked: true
			,name: 'Recipients'
		},{
			boxLabel: 'Parents'
			,checked: true
			,inputValue: 'Parents'
			,name: 'Recipients'
		}]
	}]
	
});