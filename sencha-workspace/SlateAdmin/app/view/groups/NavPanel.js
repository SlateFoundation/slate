/*jslint browser: true, undef: true *//*global Ext*/
// TODO: Is this class being used?
Ext.define('SlateAdmin.view.groups.NavPanel', {
    extend: 'Ext.tree.Panel',
    xtype: 'groups-navpanel',

    // panel config
    title: 'Groups',
    bodyPadding: 0,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [{
            xtype: 'button',
            flex: 1,
            href: '#groups/manage',
            hrefTarget: null,
            text: 'Manage Groups'
        }]
    }],

    // treepanel config
    store: 'Groups',
    rootVisible: false,
    useArrows: true,
    singleExpand: true,
    viewConfig: {
        toggleOnDblClick: false,
        loadMask: false
    }
});
