Ext.define('Slate.ui.form.Panel', {
    extend: 'Ext.form.Panel',
    xtype: 'slate-formpanel',
    requires: [
        'Slate.ui.PanelFooter'
    ],


    // formpanel configuration
    trackResetOnLoad: true,


    config: {

        /**
         * @cfg {Slate.ui.PanelFooter|Ext.Component|Object|String|null}
         *
         * A component, config, or xtype for a footer component
         */
        footer: null
    },


    // container configuration
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        allowBlank: false,
        msgTarget: 'under',
        selectOnFocus: true,
        labelAlign: 'right',
        labelWidth: 150
    },


    // component configuration
    componentCls: 'slate-formpanel',


    // config handlers
    applyFooter: function(footer, oldFooter) {
        var configType = typeof footer;

        if (configType == 'boolean') {
            footer = {
                hidden: !footer
            };
        } else if (configType == 'string') {
            footer = {
                xtype: footer
            };
        } else if (Ext.isArray(footer)) {
            footer = {
                items: footer
            };
        }

        return Ext.factory(footer, 'Slate.ui.PanelFooter', oldFooter);
    },

    updateFooter: function(footer, oldFooter) {
        var me = this,
            items = me.items;

        if (items && items.isMixedCollection) {
            if (oldFooter) {
                me.remove(oldFooter);
            }

            if (footer) {
                me.addDocked(footer);
            }
        }
    },


    // container lifecycle
    initItems: function() {
        var me = this,
            footer = me.getFooter();

        me.callParent(arguments);

        if (footer) {
            me.addDocked(footer);
        }
    }
});