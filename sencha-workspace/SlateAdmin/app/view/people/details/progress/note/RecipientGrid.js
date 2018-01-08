/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.note.RecipientGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'people-details-progress-note-recipientgrid',
    requires: [
        'Ext.ux.CheckColumn',
        'Ext.selection.CheckboxModel',
        'Slate.model.person.Person'
    ],

    split: true,
    border: false,
    store: 'people.progress.NoteRecipients',
    cls: 'has-small-group-headers',
    columns: [{
        flex: 1,
        xtype: 'templatecolumn',
        header: 'Name',
        dataIndex: 'FullName',
        tpl: '<tpl if="Status">({Status})</tpl> <tpl if="Email"><a href="mailto:{Email}" title="{Email}">{FullName}</a><tpl else>{FullName}</tpl>'
    },{
        width: 130,
        header: 'Relationship',
        dataIndex: 'Label'
    }],
    tbar: [{
        text: 'Add Custom Recipient&hellip;',
        action: 'addCustomRecipientBtn',
        cls: 'glyph-success',
        glyph: 0xf055, // fa-plus-circle
        menu: {
            width: 240,
            plain: true,
            bodyPadding: '10 15',
            enableKeyNav: false,
            defaults: {
                labelAlign: 'top',
                margin: '0 0 10'
            },
            items: [{
                xtype: 'combo',
                name: 'Person',
                itemId: 'customRecipientPersonCombo',
                fieldLabel: 'Full name',
                queryMode: 'remote',
                queryParam: 'q',
                triggerAction: 'query',
                allowBlank: false,
                valueField: 'ID',
                displayField: 'FullName',
                store: {
                    model: 'Slate.model.person.Person',
                    pageSize: 0,
                    remoteSort: false,
                    sorters: [{
                        property: 'SortName',
                        direction: 'ASC'
                    }],
                    proxy: {
                        type: 'slate-people',
                        summary: true
                    }
                }
            },{
                xtype: 'textfield',
                name: 'Email',
                fieldLabel: 'Email',
                vtype: 'email',
                allowBlank: false
            },{
                margin: '10 0',
                xtype: 'button',
                glyph: 0xf055, // fa-plus-circle
                text: 'Add',
                action: 'addRecepient'
            }]
        }
    }],
    initComponent: function () {

        var groupingFeature = Ext.create('Ext.grid.feature.Grouping', {
            collapse: Ext.emptyFn,
            groupHeaderTpl: '{name}',
            collapsible: false
        });
        this.selModel = Ext.create('Ext.selection.CheckboxModel',{
            checkOnly: true
        });
        this.features = [groupingFeature];
        this.callParent(arguments);
    }
});
