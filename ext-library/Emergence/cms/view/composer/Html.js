/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.view.composer.Html', {
    extend: 'Emergence.cms.view.composer.Abstract',
    xtype: 'emergence-cms-composer-html',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],

    inheritableStatics: {
        contentItemClass: ['Emergence\\CMS\\Item\\Text', 'Emergence\\CMS\\Item\\RichText'],
        buttonCfg: {
            text: 'Write Text',
            iconCls: 'icon-content-richtext',
            tooltip: 'Add another text section.'
        }
    },

    title: 'Text',
    height: 300,
    collapsible: false,
    items: [{
        xtype: 'htmleditor',
        enableColors: false,
        enableAlignments: false
    }],

    initComponent: function() {
        var me = this,
            editorValue = me.contentItem ? me.contentItem.Data : '';

        me.callParent(arguments);
        me.down('htmleditor').setValue(editorValue);
        me.on({
            scope: me,
            dragstart: 'backupEditor',
            siblingdragstart: 'backupEditor',
            dropped: 'repairEditor',
            siblingdrop: 'repairEditor'
        });
    },

    repairEditor: function() {
        var me = this,
            editor = me.down('htmleditor');

        // test if editor needs repair -- body will be empty
        if (Ext.fly(editor.getEditorBody()).is(':empty')) {
            Ext.batchLayouts(function() {
                editor.destroy();
                me.add(editor.cloneConfig({
                    value: me.backupValue || (me.contentItem ? me.contentItem.Data : '')
                }));
            });
        }
    },

    backupEditor: function() {
        this.backupValue = this.down('htmleditor').getValue();
    },

    getItemData: function() {
        return Ext.applyIf({
            Class: 'Emergence\\CMS\\Item\\RichText',
            Data: this.down('htmleditor').getValue()
        }, this.callParent());
    }
});