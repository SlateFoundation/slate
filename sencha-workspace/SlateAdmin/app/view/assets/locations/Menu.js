/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.assets.locations.Menu', {
    extend: 'Ext.menu.Menu'
    ,xtype: 'assets-locations-menu'

	,config: {
		record: null
	}
    ,items: [{
        text: 'Delete location'
        ,action: 'delete-location'
        ,icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Create child location'
        ,action: 'create-child-location'
        ,icon: '/img/icons/fugue/blue-document.png'
    }]
});
