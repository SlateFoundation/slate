Ext.define('EmergenceEditor.view.TabPanel', {
    extend: 'Ext.tab.Panel',
    xtype: 'emergence-tabpanel',
    requires: [
        'EmergenceEditor.view.tab.Activity',

        'Ext.ux.TabCloseMenu',
        'Ext.ux.TabReorderer'
    ],


    componentCls: 'emergence-tabpanel',
    stateful: true,
    stateId: 'editorTabs',
    stateEvents: ['remove', 'add'],

    plugins: [
        {
            ptype: 'tabclosemenu',
            listeners: {
                beforemenu: function(menu, card, plugin) {
                    this.getCmp().fireEvent('beforetabmenu', menu, card, plugin);
                }
            }
        },
        'tabreorderer'
    ],

    items: [{
        xtype: 'emergence-tab-activity',
        itemId: 'activity'
    }],


    // lifecycle methods
    getState: function() {
        var openTabs = [],
            items = this.items.getRange(),
            itemsLength = items.length,
            itemIndex = 0,
            state;

        for (; itemIndex < itemsLength; itemIndex++) {
            state = items[itemIndex].getState();

            if (state.xtype) {
                openTabs.push(state);
            }
        }

        return { openTabs: openTabs };
    },

    applyState: function(state) {
        var openTabs = state.openTabs;

        if (openTabs && openTabs.length) {
            this.add(openTabs);
        }
    },


    // local methods
    findUsableTab: function(xtype, token) {
        return this.items.findBy(function(card) {
            return card.isXType(xtype) && card.usableForToken(token);
        });
    }
});