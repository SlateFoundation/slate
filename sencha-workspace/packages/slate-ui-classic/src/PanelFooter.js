Ext.define('Slate.ui.PanelFooter', {
    extend: 'Ext.container.Container',
    xtype: 'slate-panelfooter',


    dock: 'bottom',


    // container configuration
    layout: {
        align: 'center',
        type: 'hbox',
        pack: 'end'
    },


    // component configuration
    componentCls: 'slate-panelfooter'
});