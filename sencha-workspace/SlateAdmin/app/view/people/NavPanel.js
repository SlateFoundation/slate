/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.people.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'people-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search',
        'SlateAdmin.view.people.AdvancedSearchForm'
    ],

    title: 'People',
    autoScroll: true,
    bodyPadding: 0,

    dockedItems: [{
        dock: 'top',

        xtype: 'form',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'jarvus-searchfield',
            anchor: '100%',
            emptyText: 'Search all people…'
        }]
    }],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'people-advancedsearchform',
        border: 0,
        bodyPadding: '10 10 0'
    },{
        xtype: 'treepanel',
        itemId: 'groups',
        border: '1 0',

        // treepanel config
        store: 'people.GroupsTree',
        scroll: false,
        rootVisible: true,
        useArrows: true,
        singleExpand: true,
        hideHeaders: true,
        viewConfig: {
            toggleOnDblClick: false
        },
        columns: [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'text'
//        },{
//            width: 20,
//            dataIndex: 'Population'
        }]
    }]
});