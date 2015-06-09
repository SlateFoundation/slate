/*jslint browser: true, undef: true *//*global Ext*/
/**
 * People Navigation Panel, an extension of Ext Panel with a vbox layout containing the advanced search form and
 * a tree panel, with a formpanel/searchfield docked to top of container.
 */
Ext.define('SlateAdmin.view.people.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'people-navpanel',
    requires: [
        'Ext.form.Panel',
        'Jarvus.ext.form.field.Search',
        'SlateAdmin.view.people.AdvancedSearchForm'
    ],

    /** @cfg title="People" */
    title: 'People',
    autoScroll: true,
    bodyPadding: 0,

    /**
     * @cfg {Object[]} dockedItems components to be added as docked items to this panel
     * @cfg {Ext.form.Panel} dockedItems.top A search form docked to top of container
     * @cfg {Jarvus.ext.form.field.Search} dockedItems.top.field  A field of xtype jarvus-searchfield from jarvus-ext-search package
     */
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

    /**
     * @cfg {Object[]} items An array of child Components to be added to this container
     * @cfg {SlateAdmin.view.people.AdvancedSearchForm} items.searchform The advanced search form
     * @cfg {Ext.tree.Panel} items.treepanel A treepanel using the people.GroupsTree store
     */
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
