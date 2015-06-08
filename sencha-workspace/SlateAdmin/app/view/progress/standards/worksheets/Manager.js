/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.progress.standards.worksheets.Manager', {
    extend: 'Ext.Container', 
    xtype: 'progress-standards-worksheets-manager',
    requires: [
        'SlateAdmin.view.progress.standards.worksheets.Grid',
		'SlateAdmin.view.progress.standards.worksheets.Editor'
    ],
    
    componentCls: 'progress-standards-worksheets-manager',
	layout: 'border',
	worksheet: null,
	items: [{
        region: 'west',
        split: true,
        xtype: 'progress-standards-worksheets-grid',
        autoScroll: true,
		width: 500	
	},{
        region: 'center',
		xtype: 'progress-standards-worksheets-editor',
		flex: 1
	}],
	
	
	//helper functions
	updateWorksheet: function(worksheet){
		if(!worksheet)
			return false;
			
		var editor = this.down('progress-standards-worksheets-editor'),
			field = editor.down('textareafield[name=Description]');
		
		field.removeCls('dirty').addCls('saved');
		
		this.down('progress-standards-worksheets-editor').loadRecord(worksheet);
				
		this.worksheet = worksheet;
	},
	getWorksheet: function(){
		return this.worksheet;
	}
});
