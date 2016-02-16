/*jslint browser: true, undef: true, laxbreak: true *//*global Ext*/
Ext.define('SlateAdmin.view.progress.narratives.Mailer', {
    extend: 'Ext.Container',
    xtype: 'progress-narratives-mailer',

    requires: [
        'Ext.layout.container.VBox',
        'Ext.layout.container.HBox',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.form.CheckboxGroup',
        'Ext.util.Cookies'
    ],

    componentCls: 'progress-narratives-mailer',

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
                pack: 'center'
            },
            defaults: {
                margin: '0 8px 4px 8px'
            },
            items: [{
                xtype: 'button',
                text: 'Search',
                action: 'search'
            },{
                xtype: 'button',
                text: 'Clear Filters',
                action: 'clear-filters'
            }]
        }],
        items: [{
            xtype: 'fieldset',
            title: 'Filter reports by&hellip;',
            layout: 'hbox',
            padding: 10,
            defaultType: 'combobox',
            defaults: {
                flex: 2,
                labelAlign: 'right',
                labelWidth: 60,
                forceSelection: true,
                allowBlank: true,
                valueField: 'ID'
            },
            items: [{
                name: 'termID',
                itemId: 'termCombo',
                fieldLabel: 'Term',
                emptyText: 'Current Term',
                editable: false,
                displayField: 'Title',
                queryMode: 'local',
                store: {xclass: 'SlateAdmin.store.Terms'}
            },{
                name: 'advisorID',
                fieldLabel: 'Advisor',
                emptyText: 'Any',
                displayField: 'FullName',
                queryMode: 'local',
                typeAhead: true,
                allowBlank: true,
                store: {xclass: 'SlateAdmin.store.people.Advisors'}
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
            },{
                name: 'authorID',
                itemId: 'authorCombo',
                fieldLabel: 'Author',
                emptyText: 'All',
                displayField: 'FullName',
                queryMode: 'remote',
                queryParam: 'q',
                anyMatch: true,
                store: {
                    model: 'SlateAdmin.model.person.Person',
                    proxy: {
                        type: 'slaterecords',
                        url: '/progress/narratives/reports/authors',
                        startParam: false,
                        limitParam: false
                    }
                }
            },{
                xtype: 'checkboxgroup',
                fieldLabel: 'Recipients',
                flex: 3,
                margin: 0,
                labelWidth: 80,
                items: [{
                    boxLabel: 'Advisor',
                    inputValue: 'Advisor',
                    checked: true,
                    name: 'Recipients'
                },{
                    boxLabel: 'Parents',
                    checked: true,
                    inputValue: 'Parents',
                    name: 'Recipients'
                }]
            }]
        }]
    },{
        xtype: 'container',
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        flex: 1,
        items: [{
            xtype: 'progress-narratives-mailergrid',
            width: 450
        },{
            xtype: 'component',
            itemId: 'previewBox',
            cls: 'email-preview',
            flex: 1,
            disabled: true,
            renderTpl: '<iframe width="100%" height="100%"></iframe>',
            renderSelectors: {
                iframeEl: 'iframe'
            },
            listeners: {
                afterrender: {
                    fn: function (previewBox) {
                        this.mon(previewBox.iframeEl, 'load', function () {
                            this.fireEvent('previewload', this, previewBox);
                            previewBox.setLoading(false);
                        }, this);
                    },
                    delay: 10
                }
            }
        }]
    }]
});
