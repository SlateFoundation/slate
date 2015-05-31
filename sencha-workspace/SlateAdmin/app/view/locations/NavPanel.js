/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.locations.NavPanel', {
    extend: 'Ext.tree.Panel',
    xtype: 'locations-navpanel',
    
    // panel config
    title: 'Locations',
    bodyPadding: 0,
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        items: [{
            xtype: 'button',
            flex: 1,
            href: '#locations/manage',
            hrefTarget: null,
            text: 'Manage Locations'
        }]
    }],
    
    // treepanel config
    store: 'LocationsTree',
    rootVisible: false,
    useArrows: true,
    singleExpand: true,
    viewConfig: {
        toggleOnDblClick: false,
        loadMask: false
    }
});