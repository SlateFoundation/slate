/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.terms.Menu', {
    extend: 'Ext.menu.Menu',
    xtype: 'settings-terms-menu',

    config: {
        record: null
    },
    items: [{
        text: 'Create Subgroup',
        action: 'create-subterm',
        icon: '/img/icons/fugue/blue-document.png'
    },{
        text: 'Delete Term',
        action: 'delete-term',
        icon: '/img/icons/fugue/blue-document.png'
    }]
});