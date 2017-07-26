Ext.define('SlateAdmin.view.settings.site.RestoreButton', {
    extend: 'Ext.Button',
    xtype: 'site-restorebutton',

    config: {
        settingsLabel: 'these settings'
    },

    text: 'Use Defaults',
    cls: 'glyph-danger',
    ui: 'default-toolbar',
    glyph: 0xf021, // fa-refresh
    glyph: 0xf1da, // fa-history
    handler: function() { // TODO make it work
        Ext.Msg.show({
            title: 'Use Defaults',
            message: 'Are you sure you want to reset ' + this.getSettingsLabel() + ' to their defaults?',
            icon: Ext.Msg.WARNING,
            buttonText: {
                ok: 'Reset to Defaults'
            },
            buttons: Ext.Msg.OKCANCEL
        });
    }
});