/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('Slate.controller.Activity', {
	extend: 'Ext.app.Controller'
	
    ,views: [
        'activity.Create'
    ]

    ,refs: [{
		ref: 'activityCreateWindow'
		,autoCreate: true
		,selector: 'activity-create'
		,xtype: 'activity-create'
	}]	
	,init: function() {
		var me = this;
		
		me.control({
			'activity-create button[action=submitActivity]':{
				click: me.onActivitySubmit
			}
			,'activity-create #fileAttachment': {
				change: me.onFileAttachmentChange
			}
			,'activity-create': {
				activate: me.onCreateWindowActivate
			}
		});		
	}
	
	
	//event handlers
	,onCreateWindowActivate: function(window) {
		var clearBtn = window.down('#fileClearBtn');
		
		clearBtn.hide();
	}
	
	,onFileAttachmentChange: function(field) {
		var clearBtn = field.nextSibling('button');
		
		clearBtn.show();
	}
	
	,onActivitySubmit: function(btn) {	
		var me = this
			,createWindow = me.getActivityCreateWindow()
			,record = createWindow.getContext()
			,controller = createWindow.getController()
			,handler = createWindow.getHandler()
			,form = btn.up('form')
			,fileField = form.down('#fileAttachment')
			,fileExtension = fileField.getValue().match(/(.*)[\/\\]([^\/\\]+)\.(\w+)$/)[3]
			,basic = form.getForm()
			,submitUrl = createWindow.getSubmitUrl();

		if(basic.isValid())
		{
			form.setLoading({
				xtype: 'loadmask'
				,message: 'Loading&hellip;'
			});

			
			form.submit({
				url: submitUrl
				,success: function(f, action){
					basic.reset();
					
					form.setLoading(false);
					createWindow.hide();
					
					if(controller && handler) {
						controller = me.application.getController(controller);
						
						controller[handler](record);
					}
				}
				,failure: function(f, action) {
					form.setLoading(false);
					if(action.result) {				
						if(action.result.loginRequired) {
							me.application.fireEvent('sessionexpired');
						}
						
						if(action.result.error) {
							Ext.Msg.alert('Error', action.result.error);
						}
					}
				}
			});
		}
	}
});