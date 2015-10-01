/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.statuses.Menu', {
    extend: 'Ext.menu.Menu'
    ,xtype: 'assets-statuses-menu'

	,config: {
		record: null
	}
    ,items: [{
        text: 'Delete status'
        ,action: 'delete-status'
        ,icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Create child status'
        ,action: 'create-child-status'
        ,icon: '/img/icons/fugue/blue-document.png'
    }]
});
