Ext.define('Slate.ui.FormPanel', {
    extend: 'Ext.form.Panel',
    xtype: 'slate-formpanel',


    // formpanel configuration
    trackResetOnLoad: true,


    // container configuration
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    defaults: {
        allowBlank: false,
        msgTarget: 'side',
        selectOnFocus: true,
        labelAlign: 'right',
        labelWidth: 150
    },


    // component configuration
    componentCls: 'slate-formpanel'
});