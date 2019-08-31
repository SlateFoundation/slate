Ext.define('Emergence.cms.view.DualView', {
    extend: 'Ext.Container',
    xtype: 'emergence-cms-dualview',
    cls: 'emergence-cms-dualview',
    requires: [
        'Emergence.cms.view.DualViewController',
        'Emergence.cms.view.Editor',
        'Emergence.cms.view.Preview'
    ],

    controller: 'emergence-cms-dualview',

    layout: 'hbox',

    initComponent: function() {
        var me = this;

        me.items = [
            Ext.apply({
                reference: 'preview',
                cls: 'emergence-cms-preview',
                flex: 1,

                xtype: 'emergence-cms-preview'
            }, me.previewConfig),
            Ext.apply({
                reference: 'editor',
                cls: 'emergence-cms-editor',
                flex: 1,

                xtype: 'emergence-cms-editor'
            }, me.editorConfig)
        ];

        me.callParent();
    }
});