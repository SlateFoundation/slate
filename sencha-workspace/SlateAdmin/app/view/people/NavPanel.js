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
        'SlateAdmin.view.people.AdvancedSearchForm',
        'Emergence.store.ChainedTree'
    ],

    /** @cfg title="People" */
    title: 'People',
    autoScroll: true,

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
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            items: [{
                flex: 1,
                xtype: 'jarvus-searchfield',
                reference: 'peopleSearchField',
                hideTrigger: true,
                triggers: {
                    clear: {
                        cls: 'x-form-clear-trigger',
                        handler: function () {
                            this.setValue('');
                        }
                    }
                },
                emptyText: 'Search all people…',
                listeners: {
                    change: function (me, newValue) {
                        if (newValue.length > 0) {
                            me.setHideTrigger(false);
                        } else {
                            me.setHideTrigger(true);
                        }
                    }
                }
            }, {
                width: 36,
                xtype: 'button',
                enableToggle: true,
                glyph: 0xf013, // fa-cog
                cls: 'navpanel-advanced-search-toggle',
                ariaLabel: 'Toggle advanced search options',
                ui: 'plain',
                toggleHandler: function (me, state) {
                    Ext.getCmp('navpanel-search-criteria').setCollapsed(!state);
                }
            }],
        }]
    }, {
        dock: 'bottom',
        xtype: 'container',
        layout: 'fit',
        padding: 10,
        items: [{
            xtype: 'button',
            action: 'create-person',
            text: 'Create Person',
            glyph: 0xf055, // fa-plus-circle
            href: '#people/create',
            hrefTarget: '_self'
        }]
    }],

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    /**
     * @cfg {Object[]} items An array of child Components to be added to this container
     * @cfg {SlateAdmin.view.people.AdvancedSearchForm} items.searchform The advanced search form
     * @cfg {Ext.tree.Panel} items.treepanel A treepanel of groups
     */
    items: [{
        xtype: 'people-advancedsearchform'
    }, {
        flex: 1,

        xtype: 'treepanel',
        itemId: 'groups',

        // treepanel config
        store: {
            type: 'emergence-chainedtree',
            source: 'people.Groups',
            root: {
                Name: 'All People',
                Handle: 'slate-internal-people-root-node',
                ID: null,
                leaf: false,
                expanded: false
            }
        },
        scroll: true,
        rootVisible: true,
        singleExpand: true,
        hideHeaders: true,
        viewConfig: {
            toggleOnDblClick: false
        },
        columns: [{
            xtype: 'treecolumn',
            flex: 1,
            dataIndex: 'Name'
            //        },{
            //            width: 20,
            //            dataIndex: 'Population'
        }]
    }]
});
