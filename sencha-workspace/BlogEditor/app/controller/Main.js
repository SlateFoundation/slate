/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,BlogEditor*/
Ext.define('BlogEditor.controller.Main', {
	extend: 'Ext.app.Controller'
	,views: [
        'Manager'
        ,'HtmlEditor'
     ]
	,stores: ['BlogPosts']
    ,refs: [{
		ref: 'blogEditor'
		,selector: 'blogeditor-view'
    },{
		ref: 'blogManager'
		,selector: 'blogeditor-manager'
		,autoCreate: true
		,xtype: 'blogeditor-manager'
    },{
		ref: 'viewport'
		,selector: 'blogeditor-viewport'
    },{
    	ref: 'editor'
    	,autoCreate: true
    	,selector: 'htmleditor-view'
    },{
    	ref: 'container'
    	,selector: 'blogeditor-view container'
    }]

    ,init: function() {
		var me = this;
		
		me.control({
			'blogeditor-manager': {
				activate: me.onBlogActivate
			}		
			
			,'blogeditor-view  button[action=showEditor]': {
				click: me.showEditor
			}
		});		
	}
	
	,onBlogActivate: function() {
		var me = this;
		
		//FOR TESTING// GET inidividual content via handle
		Ext.Ajax.request({
		    url: '/blog/json/testing_mp4/'
//		    ,params: {
//		        id: 1
//		    }
		    ,success: function(response){
		        var record = Ext.decode(response.responseText);
		      //  console.log(text);
		        //pass decoded response data to function for assigning values
		        me.onDataRequest(record);
		    }
		});
		
		console.log('manager active');
	}
	
	,showEditor: function() {
		var me = this
			,htmlEditor = me.getEditor()
			,mainView = me.getBlogEditor()
			,editorContainer = me.getContainer();
		console.log(htmlEditor);
		console.log(maniView);
		console.log(editorContainer);
		//editorContainer.getEl().show(true);
		debugger;
		editorContainer.add(htmlEditor);
		
		//console.log(editorContainer.getEl());
		
		debugger;
		
		//console.log(editorContainer.get('Container'));
		
		//debugger;
	}
	
	,onDataRequest: function(blogPostData) {
		var me = this
			,editor = me.getBlogEditor()
			,manager = me.getBlogManager()
			,editorForm = editor.down('form')
			,data = blogPostData.data
			,form = editorForm.getForm();
	
			//editorForm.getForm().loadRecord(data);
					
//		console.log(form.getFields());
//		debugger;
		 
		
//		formFields.items[0].setValue(blogPostData.data.Handle);
//		me.getBlogEditor().down('BlogTitle');
		
	}
	
});