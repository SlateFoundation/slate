/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.activity.Create', {
	extend: 'Ext.window.Window'
	,xtype: 'activity-create'

	,title: 'Activity Create Window'
	,config: {
		context: null
		,submitUrl: null
		,controller: null
		,handler: null
	}
	,centered: true
	,modal: true
	,height: 200
	,width: 400

	,items: [{
		xtype: 'form'
		,defaults: {
		    labelSeparator: ''
		    ,anchor: '100%'
		}
		,items: [{
			xtype: 'textareafield'
			,name: 'Note'
			,labelAlign: 'top'
			,allowBlank: false
			,fieldLabel: 'Note'
		},{
			xtype: 'fieldset'
			,layout: {
				type: 'hbox'
				,align: 'stretch'
			}
			,defaults: {
				labelSeparator: ''
				,allowBlank: true
			}
			,items: [{
				xtype: 'filefield'
				,labelWidth: '20%'
				,flex: 1
				,itemId: 'fileAttachment'
				,buttonText: 'Select Media Attachment'
//				,submitValue: false
				,name: 'mediaUpload'
			},{
				xtype: 'button'
				,text: 'Clear'
				,itemId: 'fileClearBtn'
				,submitValue: false
				,hidden: true
				,handler: function(btn) {
					var fileField = btn.previousSibling('filefield');

					fileField.reset();
					btn.hide();
				}
			}]
		},{
			xtype: 'button'
			,text: 'Submit'
			,action: 'submitActivity'
		}]
    }]
});