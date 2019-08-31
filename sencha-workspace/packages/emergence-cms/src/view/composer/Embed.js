/* jslint browser: true, undef: true *//* global Ext*/
Ext.define('Emergence.cms.view.composer.Embed', {
    extend: 'Emergence.cms.view.composer.Abstract',
    alias: 'emergence-cms-composer.embed',
    cls: 'embed-composer',
    requires: [
        'Ext.form.field.TextArea'
    ],

    inheritableStatics: {
        contentItemClass: 'Emergence\\CMS\\Item\\Embed',
        buttonCfg: {
            text: 'Embed Code',
            glyph: 0xf121+'@FontAwesome', // fa-code
            cls: 'icon-w-30',
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
            editorValue = me.contentItem ? me.contentItem.Data : '',
            textarea;

        me.callParent();

        textarea = me.textarea = me.down('textarea').setValue(editorValue);
        textarea.on('change', 'firePreviewChange', me);
    },

    getPreviewHtml: function(callback) {
        callback(this.textarea.getValue());
    },

    getItemData: function() {
        return Ext.applyIf({
            Data: this.textarea.getValue()
        }, this.callParent());
    }
});