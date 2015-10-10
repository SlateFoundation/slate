/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.sbg.narratives.Editor',{
    extend: 'Ext.form.Panel',
    xtype: 'sbg-narratives-editor',

    config: {
        worksheet: null
    },
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
            name: 'Section',
            xtype: 'displayfield',
            fieldLabel: 'Section',
            disabled: true,
            disabledClass: '',
            setValue : function (v) {
                if (this.rendered) {
                    return this.inputEl.dom.innerHTML =
                        '<a href="/sections/'+v.Handle+'" target="_blank">'
                        +v.Title
                        +'</a>';
                }
            }
        }, {
            name: 'Student',
            xtype: 'displayfield',
            fieldLabel: 'Student',
            disabled: true,
            disabledClass: '',
            setValue : function (v) {
                if (this.rendered) {
                    return this.inputEl.dom.innerHTML =
                        '<a href="/users/'+v.Username+'" target="_blank">'
                        +v.FirstName+' '+v.LastName
                        +'</a>';
                }
            }
        }, {
            name: 'Grade',
            xtype: 'combo',
            fieldLabel: 'Overall grade',
            mode: 'local',
            store: ['A', 'B', 'C', 'D', 'F', 'Inc'],
            triggerAction: 'all',
            forceSelection: true,
            selectOnFocus: true,
            emptyText: '-',
            width: 150
        }]
    }, {
        xtype: 'fieldset',
        itemId: 'standardsForm',
        padding: '5 0'
    }, {
        xtype: 'container',
        layout: 'form',
        defaults: {
            labelAlign: 'top',
            xtype: 'htmleditor',
            labelStyle: 'margin-top: 8px'
        },
        items: [{
            name: 'Assessment',
            fieldLabel: 'Assessment'
        }, {
            name: 'Comments',
            fieldLabel: 'Comments'
        }]
    }],
    buttonAlign: 'center',
    buttons: [{
        text: 'Revert Changes',
        action: 'revertChanges'
    }, {
        xtype: 'tbspacer',
        flex: 1
    }, {
        text: 'Save as Draft',
        action: 'saveDraft'
    }, {
        text: 'Save as Finished',
        action: 'saveFinished'
    }]
});
