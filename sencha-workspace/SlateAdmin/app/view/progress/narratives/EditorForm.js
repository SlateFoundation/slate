/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.EditorForm',{
    extend: 'Ext.form.Panel',
    xtype: 'progress-narratives-editorform',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],

    viewConfig: {
        getRowClass: function (record) {
            return 'status-'+record.get('Status');
        },
        emptyText: 'You are not currently an instructor for any students'
    },
    border: false,
    bodyPadding: 10,
    disabled: true,
    autoScroll: true,
    items: [{
        xtype: 'fieldset',
        padding: '5 8',
        items: [{
            name: 'section',
            xtype: 'displayfield',
            fieldLabel: 'Section',
            displayTpl: '<a href="/sections/{Code}" target="_blank">{Title:htmlEncode}</a>',
            renderer: function(v) {
                if (!v) {
                    return '';
                }

                return this.getTpl('displayTpl').apply(v.getData());
            }
        },{
            name: 'student',
            xtype: 'displayfield',
            fieldLabel: 'Student',
            displayTpl: '<a href="/people/{Username}" target="_blank">{FullName:htmlEncode}</a>',
            renderer: function(v) {
                if (!v) {
                    return '';
                }

                return this.getTpl('displayTpl').apply(v.getData());
            }
        },{
            name: 'term',
            xtype: 'displayfield',
            fieldLabel: 'Term',
            displayTpl: '{Title}',
            renderer: function(v) {
                if (!v) {
                    return '';
                }

                return this.getTpl('displayTpl').apply(v.getData());
            }
        // },{
        //     name: 'Grade',
        //     xtype: 'combo',
        //     fieldLabel: 'Overall grade',
        //     mode: 'local',
        //     store: ['A', 'B', 'C', 'D', 'F', 'Inc'],
        //     triggerAction: 'all',
        //     forceSelection: true,
        //     selectOnFocus: true,
        //     emptyText: '-',
        //     width: 150
        }]
    // }, {
    //     xtype: 'fieldset',
    //     itemId: 'standardsForm',
    //     padding: '5 0'
    },{
        xtype: 'textarea',
        anchor: '100%',
        grow: true,
        name: 'Notes',
        fieldLabel: 'Notes from Teacher',
        labelAlign: 'top'
    },{
        xtype: 'textarea',
        anchor: '100%',
        grow: true,
        name: 'Quote',
        fieldLabel: 'Quote about Student',
        labelAlign: 'top'
    }],
    buttonAlign: 'center',
    buttons: [{
        itemId: 'revertChangesBtn',

        text: 'Revert Changes'
    },{
        xtype: 'tbfill'
    },{
        itemId: 'saveDraftBtn',

        text: 'Save as Draft'
    },{
        itemId: 'saveFinishedBtn',

        text: 'Save as Finished'
    }]
});
