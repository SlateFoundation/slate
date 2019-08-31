/* jslint browser: true, undef: true *//* global Ext*/
Ext.define('Emergence.cms.view.composer.Html', {
    extend: 'Emergence.cms.view.composer.Abstract',
    alias: 'emergence-cms-composer.html',
    cls: 'html-composer',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],

    inheritableStatics: {
        contentCls: 'content-html',
        contentItemClass: ['Emergence\\CMS\\Item\\RichText', 'Emergence\\CMS\\Item\\Text'],
        buttonCfg: {
            text: 'Rich Text',
            glyph: 0xf0f6+'@FontAwesome', // fa-file-text-o
            cls: 'icon-w-20',
            tooltip: 'A block of text with rich formatting'
        }
    },

    title: 'Text',
    height: 300,
    layout: 'fit',
    items: {
        xtype: 'htmleditor',
        enableColors: false,
        enableAlignments: false,
        enableFont: false,
        enableFontSize: false
    },

    initComponent: function() {
        var me = this,
            editorValue = me.contentItem ? me.contentItem.Data : '';

        me.callParent(arguments);

        me.down('htmleditor').setValue(editorValue).on('change', 'onEditorChange', me);

        //        me.on({
        //            scope: me,
        //            dragstart: 'backupEditor',
        //            siblingdragstart: 'backupEditor',
        //            dropped: 'repairEditor',
        //            siblingdrop: 'repairEditor'
        //        });
    },

    onEditorChange: function(htmleditor, html) {
        this.fireEvent('previewchange', this, html);
    },

    getPreviewHtml: function(callback) {
        callback(this.down('htmleditor').getValue());
    },

    getItemData: function() {
        return Ext.applyIf({
            Data: this.down('htmleditor').getValue()
        }, this.callParent());
    }

//    repairEditor: function() {
//        var me = this,
//            editor = me.down('htmleditor');
//
//        // test if editor needs repair -- body will be empty
//        if (Ext.fly(editor.getEditorBody()).is(':empty')) {
//            Ext.batchLayouts(function() {
//                editor.destroy();
//                me.add(editor.cloneConfig({
//                    value: me.backupValue || (me.contentItem ? me.contentItem.Data : '')
//                }));
//            });
//        }
//    },
//
//    backupEditor: function() {
//        this.backupValue = this.down('htmleditor').getValue();
//    },
});