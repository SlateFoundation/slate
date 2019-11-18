Ext.define('SlateAdmin.widget.PrintPreview', {
    extend: 'Ext.Component',
    xtype: 'slate-printpreview',

    componentCls: 'print-preview',
    renderTpl: '<iframe width="100%" height="100%"></iframe>',
    renderSelectors: {
        iframeEl: 'iframe'
    }
});