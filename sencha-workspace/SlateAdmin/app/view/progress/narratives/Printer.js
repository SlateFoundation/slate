/*jslint browser: true, undef: true, laxbreak: true *//*global Ext*/
Ext.define('SlateAdmin.view.progress.narratives.Printer', {
    extend: 'Ext.Container',
    xtype: 'progress-narratives-printer',

    requires: [
        'Ext.layout.container.VBox',
        'Ext.layout.container.HBox',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.util.Cookies'
    ],

    componentCls: 'progress-narratives-printer',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    items: [{
        xtype: 'form',
        itemId: 'filterForm',
        bodyPadding: 5,
        dockedItems: [{
            dock: 'bottom',
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            defaults: {
                margin: '0 8px 4px 8px'
            },
            items: [{
                xtype: 'tbfill'
            },{
                xtype: 'button',
                text: 'Preview',
                action: 'preview'
            },{
                xtype: 'button',
                text: 'Print to PDF',
                action: 'print-pdf'
            },{
                xtype: 'button',
                text: 'Print via Browser',
                action: 'print-browser'
            },{
                xtype: 'button',
                text: 'Email to Parents',
                action: 'email',
                disabled: true
            },{
                xtype: 'button',
                text: 'Clear Filters',
                action: 'clear-filters'
            },{
                xtype: 'tbfill'
            }]
        }],
        items: [{
            xtype: 'fieldset',
            title: 'Filter reports by&hellip;',
            layout: 'hbox',
            padding: 10,
            defaultType: 'combobox',
            defaults: {
                flex: 1,
                labelAlign: 'right',
                labelWidth: 60,
                forceSelection: false,
                allowBlank: true,
                valueField: 'ID'
            },
            items: [{
                name: 'termID',
                fieldLabel: 'Term',
                emptyText: 'Current Term',
                displayField: 'Title',
                itemId: 'termSelector',
                valueField: 'ID',
                queryMode: 'local',
                store: 'Terms'
            },{
                name: 'advisorID',
                fieldLabel: 'Advisor',
                emptyText: 'Any',
                displayField: 'FullName',
                queryMode: 'local',
                typeAhead: true,
                allowBlank: true,
                store: 'people.Advisors'
            },{
                name: 'studentID',
                itemId: 'studentCombo',
                fieldLabel: 'Student',
                emptyText: 'All',
                displayField: 'FullName',
                queryMode: 'remote',
                queryParam: 'q',
                anyMatch: true,
                store: {
                    model: 'SlateAdmin.model.person.Person',
                    proxy: {
                        type: 'slaterecords',
                        url: '/people',
                        startParam: false,
                        limitParam: false
                    }
                }
/*
                store: {
                    xclass: 'SlateAdmin.store.people.People'
                }
*/
/*
            },{
                name: 'authorID',
                fieldLabel: 'Author',
                emptyText: 'Any',
                displayField: 'FullName',
                typeAhead: true,
                store: {
                    autoLoad: true,
                    fields: [
                        'FirstName',
                        'LastName',
                        {name: 'ID', type: 'int'},
                        {
                            name: 'FullName',
                            convert: function (v, r) {
                                return r.data.data[0].LastName + ', ' + r.data.data[0].FirstName;
                            }
                        }
                    ],
                    proxy: {
                        type: 'slateapi',
                        url: '/progress/narratives/authors'
                    }
                }
*/
            }]
        }]
    },{
        xtype: 'component',
        itemId: 'previewBox',
        cls: 'print-preview',
        flex: 1,
        disabled: true,
        renderTpl: '<iframe width="100%" height="100%"></iframe>',
        renderSelectors: {
            iframeEl: 'iframe'
        }
    }]
});
