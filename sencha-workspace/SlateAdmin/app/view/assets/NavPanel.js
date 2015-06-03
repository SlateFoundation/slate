/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.assets.NavPanel', {
    extend: 'Ext.Panel',
    xtype: 'assets-navpanel',
    requires: [
        'Ext.tree.Panel',
        'Jarvus.ext.form.field.Search'
//        'Jarvus.ext.override.tree.View'
    ],

    title: 'Assets',
    autoScroll: true,
    bodyPadding: 0,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    
    dockedItems: [{
        xtype: 'form',
        dock: 'top',
        cls: 'navpanel-search-form',
        items: [{
            xtype: 'searchfield',
            anchor: '100%',
            emptyText: 'Search Assets and Tickets'
        }]
    }],

    items: [{
        xtype: 'treepanel',
        itemId: 'filters',
        border: false,
        bodyBorder: false,
        hideHeaders: true,
        
        columns: {
            items: [{
                xtype: 'treecolumn',
                dataIndex: 'text',
                flex: 1
            },{
                text: 'Count',
                xtype: 'templatecolumn',
                width: 42,
                tdCls: 'tree-count-cell',
                tpl: '<tpl if="!hideCount"><span class="count-badge">{qtitle:number("0,000")}</span></tpl>',
                align: 'right'
            }]
        },
        store: 'assets.TreeNodes',
        rootVisible: false,
        useArrows: true
//        singleExpand: true
    }]
});