Ext.define('BlogEditor.view.Manager', {
	extend: 'Ext.Panel'
	,alias: 'widget.blogeditor-manager'
	,requires: [
		'BlogEditor.view.Main'
		,'BlogEditor.view.HtmlEditor'
	]
	,layout: 'border'	
	,items: [{
		xtype: 'blogeditor-view'
		,region: 'center'
	}] 
})