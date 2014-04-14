Ext.define('BlogEditor.store.BlogPosts', {
	extend: 'Ext.data.Store'
	,requires: [
		'BlogEditor.model.BlogPost'	
	]
	,model: 'BlogEditor.model.BlogPost'
});