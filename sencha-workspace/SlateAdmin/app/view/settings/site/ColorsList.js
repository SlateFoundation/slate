Ext.define('SlateAdmin.view.settings.site.ColorsList', {
    extend: 'Ext.Panel',
    xtype: 'site-colorslist',
    requires: [
        'Ext.ux.colorpick.Field',
        'SlateAdmin.view.settings.site.RestoreButton'
    ],

    initComponent: function() {
        var me = this,
            colors = me.colors,
            fields = [];

        me.callParent(arguments);

        Object.keys(colors).forEach(function(label) {
            fields.push({
                xtype: 'colorfield',
                fieldLabel: label,
                value: colors[label],
                width: '100%'
            });
        });

        me.insert(0, fields);

        if (me.restoreLabel) {
            me.down('#restore-button').setSettingsLabel('<strong>' + me.restoreLabel + '</strong>');
        }
    },

    colors: {},

    dockedItems: [
        {
            xtype: 'toolbar',
            dock: 'top',
            items: [
                {
                    itemId: 'restore-button',
                    xtype: 'site-restorebutton'
                }
            ]
        }
    ]
})