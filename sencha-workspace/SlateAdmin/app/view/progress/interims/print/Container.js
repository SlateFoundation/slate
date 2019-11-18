Ext.define('SlateAdmin.view.progress.interims.print.Container', {
    extend: 'Ext.container.Container',
    xtype: 'progress-interims-print-container',
    requires: [
        'SlateAdmin.widget.field.Person',
        'SlateAdmin.widget.PrintPreview',

        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Separator'
    ],


    componentCls: 'progress-interims-print-container',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'form',
            itemId: 'optionsForm',
            bodyPadding: 5,
            items: [
                {
                    xtype: 'fieldset',
                    itemId: 'filtersFieldset',
                    title: 'Filter reports by&hellip;',
                    layout: 'hbox',
                    padding: 10,
                    defaultType: 'combo',
                    defaults: {
                        flex: 1,
                        labelAlign: 'right',
                        labelWidth: 60,
                        forceSelection: true,
                        allowBlank: true,
                        typeAhead: false,
                        queryMode: 'local',
                        emptyText: 'Any',
                        matchFieldWidth: false,
                        anyMatch: true
                    },
                    items: [
                        {
                            name: 'term',
                            fieldLabel: 'Term',
                            emptyText: 'Current Term',

                            store: 'Terms',
                            displayField: 'Title',
                            valueField: 'Handle'
                        },
                        {
                            name: 'advisor',
                            fieldLabel: 'Advisor',

                            store: 'people.Advisors',
                            displayField: 'SortName',
                            valueField: 'Username'
                        },
                        {
                            name: 'author',
                            fieldLabel: 'Author',

                            store: 'progress.interims.Authors',
                            displayField: 'SortName',
                            valueField: 'Username'
                        },
                        {
                            xtype: 'slate-personfield',
                            name: 'student',
                            fieldLabel: 'Student',
                            appendQuery: 'class:student',
                            queryMode: 'remote'
                        },
                        {
                            name: 'group',
                            fieldLabel: 'Group',

                            store: 'people.Groups',
                            displayField: 'namesPath',
                            valueField: 'Handle'
                        },
                        {
                            name: 'status',
                            fieldLabel: 'Status',

                            store: ['published', 'draft', 'any'],
                            value: 'published',

                            editable: false
                        }
                    ]
                }
            ],
            bbar: [
                { xtype: 'tbfill' },
                {
                    xtype: 'button',
                    text: 'Preview Printout',
                    action: 'load-printout'
                },
                {
                    xtype: 'button',
                    text: 'Print via Browser',
                    action: 'print-printout'
                },
                {
                    xtype: 'button',
                    text: 'Open to Browser Tab',
                    action: 'open-tab'
                },
                // {
                //     xtype: 'button',
                //     text: 'Print to PDF',
                //     action: 'print-pdf'
                // },
                {
                    xtype: 'button',
                    text: 'Save to CSV',
                    action: 'save-csv'
                },
                { xtype: 'tbseparator' },
                {
                    text: 'Reset Options',
                    action: 'reset-options'
                },
                { xtype: 'tbfill' }
            ]
        },
        {
            flex: 1,

            xtype: 'slate-printpreview',
            listeners: {
                afterrender: {
                    fn: function (previewCmp) {
                        var me = this;

                        me.mon(previewCmp.iframeEl, 'load', function () {
                            me.fireEvent('previewload', me);
                            previewCmp.setLoading(false);
                        });
                    },
                    delay: 10
                }
            }
        }
    ]
});
