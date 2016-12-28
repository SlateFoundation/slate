Ext.define('SlateAdmin.view.progress.SectionNotesForm', {
    extend: 'Ext.form.Panel',
    xtype: 'progress-sectionnotesform',
    requires: [
        'Ext.form.field.TextArea'
    ],

    config: {
        fieldName: null
    },


    title: 'Section Notes',
    bodyPadding: 10,
    trackResetOnLoad: true,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    defaults: {
        anchor: '100%',
        labelAlign: 'top'
    },

    buttons: [{
        itemId: 'revertBtn',

        text: 'Revert'
    }, {
        itemId: 'saveBtn',

        text: 'Save'
    }],

    initComponent: function() {
        var me = this;

        me.items = [{
            xtype: 'textareafield',
            name: me.getFieldName(),
            flex: 1,
            emptyText: 'Optional notes to include in every student\'s report'
        }];

        me.callParent(arguments);
    }
});