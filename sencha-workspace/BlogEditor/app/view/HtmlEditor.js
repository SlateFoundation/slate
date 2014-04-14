/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,BlogEditor*/
Ext.define('BlogEditor.view.HtmlEditor', {
	extend: 'Ext.Panel'
	,alias: 'widget.htmleditor-view'
    ,record: null
    ,title: 'Html Editor'
    ,renderTo: Ext.getBody()
    ,width: 550
    ,height: 250
    //,frame: true
    ,layout: 'fit'
    ,items: {
        xtype: 'htmleditor',
        enableColors: false,
        enableAlignments: false
    }
          
    ,updateRecord: function(record){
		if(!record)
			return false;
		var me = this;	
		me.record = record;
		me.expand();
		me.enable();
		//me.down('form').getForm().setValues(record.getData());
		
	}
	,getRecord: function(){
	//console.log(this.record);
		return this.record;
	}
});



