/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.assets.statuses.NavPanel', {
    extend: 'Ext.tree.Panel',
    xtype: 'assets-statuses-navpanel',
    
    // panel config
    title: 'Statuses',
    bodyPadding: 0,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [{
            xtype: 'button',
            flex: 1,
            href: '#statuses/manage',
            hrefTarget: null,
            text: 'Manage Statuses'
        }]
    }],
    
    // treepanel config
    store: 'assets.StatusesTree',
    rootVisible: false,
    useArrows: true,
    singleExpand: true,
    viewConfig: {
        toggleOnDblClick: false,
        loadMask: false
    }
});