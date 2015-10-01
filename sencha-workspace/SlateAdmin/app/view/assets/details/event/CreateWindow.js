/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.details.event.CreateWindow', {
	extend: 'Ext.window.Window'
	,alias: 'widget.assets-details-event-createwindow'

	,title: 'Note Create Window'
	,centered: true
	,modal: true
	,height: 200
	,width: 200
    ,items: [{
		xtype: 'form'
		,defaults: {
		    labelAlign: 'top'
		    ,labelSeparator: ''
		    ,anchor: '100%'
		}
		,items: [{
			xtype: 'textareafield'
			,name: 'Note'
			,allowBlank: false
			,fieldLabel: 'Note'
		},{
			xtype: 'button'
			,text: 'Submit'
			,action: 'submitAssetEvent'
		}]
    }]
});
