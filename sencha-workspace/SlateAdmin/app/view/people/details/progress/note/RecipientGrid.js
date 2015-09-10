/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.note.RecipientGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'people-details-progress-note-recipientgrid',
    requires: [
        'Ext.ux.CheckColumn',
        'Ext.selection.CheckboxModel'
    ],

    split: true,
    border: false,
    store: 'people.progress.NoteRecipients',
    columns: [{
        xtype: 'templatecolumn',
        header: 'Name',
        dataIndex: 'FullName',
        width: 120,
        tpl: '<tpl if="Status">({Status})</tpl> <a href="mailto:{Email}" title="{Email}">{FullName}</a>  - ({Email})'
    },{
        header: 'Relationship',
        dataIndex: 'Label',
        flex: 1
    }],
    bbar: [{
        xtype: 'tbfill'
    },{
        text: 'Add a custom recipient',
        action: 'addCustomRecipientBtn',
        icon: '/img/icons/fugue/card--plus.png',
        menu: {
            plain: true,
            enableKeyNav: false,
            items: [{
                xtype: 'combo',
                name: 'Person',
                itemId: 'customRecipientPersonCombo',
                emptyText: 'First & Last name',
                queryMode: 'remote',
                queryParam: 'q',
                allowBlank: false,
                valueField: 'ID',
                store: {
                    model: 'SlateAdmin.model.person.Person'
                },
                listConfig: {
                    getInnerTpl: function () {
                        return '{FirstName} {LastName}';
                    }
                },
                displayTpl: '<tpl for=".">{FirstName} {LastName}</tpl>',
                validator: function (v) {
                    if(v.match(/^\S+\s+\S+$/)) {
                        return true;
                    } else {
                        return 'This field should be a first and last name in the format "John Doe"';
                    }
                }
            },{
                xtype: 'textfield',
                name: 'Email',
                emptyText: 'Email Address',
                vtype: 'email',
                allowBlank: false
            },{
                xtype: 'textfield',
                name: 'Label',
                emptyText: 'Relationship to student (optional)'
            },{
                xtype: 'button',
                text: 'Save',
                action: 'addRecepient'
            }]
        }
    }],
    initComponent: function () {

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            collapse: Ext.emptyFn,
            groupHeaderTpl: '{name}'
        });
        this.selModel = Ext.create('Ext.selection.CheckboxModel',{
            checkOnly: true
        });
        this.features = [groupingFeature];
        this.callParent(arguments);
    }
});
