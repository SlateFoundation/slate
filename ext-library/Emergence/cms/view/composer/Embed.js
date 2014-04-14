/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.view.composer.Embed', {
    extend: 'Emergence.cms.view.composer.Abstract',
    xtype: 'emergence-cms-composer-embed',
    requires: [
        'Ext.form.field.TextArea'
    ],

    inheritableStatics: {
        contentItemClass: 'Emergence\\CMS\\Item\\Embed',
        buttonCfg: {
            text: 'Paste HTML (Embed Code)',
            iconCls: 'icon-content-embed',
            tooltip: 'Add a section containing an HTML embed code (from YouTube, etc).'
        }
    },

    title: 'HTML Embed Code',
    height: 100,
    items: [{
        xtype: 'textarea'
    }],

    initComponent: function() {
        var me = this,
            editorValue = me.contentItem ? me.contentItem.Data : '';

        me.callParent(arguments);

        me.down('textarea').setValue(editorValue);
    },

    getItemData: function() {
        var me = this;

        return Ext.applyIf({
            Class: 'Emergence\\CMS\\Item\\Embed',
            Data: me.down('textarea').getValue()
        }, me.callParent());
    }
});