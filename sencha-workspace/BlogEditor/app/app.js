/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,BlogEditor*/
Ext.application({
	name: 'BlogEditor'
	
	,views: [
		'Emergence.cms.view.EditorPanel'
	]
	
	,autoCreateViewport: false
	
	,launch: function() {
		
		this.editorView = Ext.create('Emergence.cms.view.EditorPanel', {
			renderTo: 'blogContainer'
		});

		this.editorView.setContentRecord(window.BlogData);
	}
});
