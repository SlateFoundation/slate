Ext.define('SlateAdmin.view.progress.terms.print.Container', {
    extend: 'Ext.container.Container',
    xtype: 'progress-terms-print-container',
    requires: [
        'SlateAdmin.widget.field.Person',
        'SlateAdmin.widget.PrintPreview',

        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Checkbox',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Separator',
        'Ext.data.ChainedStore'
    ],


    componentCls: 'progress-terms-print-container',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [
        {
            xtype: 'form',
            itemId: 'optionsForm',
            bodyPadding: 5,
            defaults: {
                xtype: 'fieldset',
                layout: 'hbox',
                padding: 10
            },
            items: [
                {
                    itemId: 'filtersFieldset',
                    title: 'Filter reports by:',
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

                            store: {
                                type: 'chained',
                                source: 'Terms'
                            },
                            valueField: 'Handle',
                            displayField: 'Title'
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

                            store: 'progress.terms.Authors',
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

                            store: {
                                type: 'chained',
                                source: 'people.Groups'
                            },
                            valueField: 'Handle',
                            displayField: 'namesPath'
                        },
                        {
                            name: 'status',
                            fieldLabel: 'Status',

                            store: ['published', 'draft', 'any'],
                            value: 'published',

                            editable: false
                        }
                    ]
                },
                {
                    itemId: 'includeFieldset',
                    title: 'Include in print:',
                    defaultType: 'checkboxfield',
                    defaults: {
                        xtype: 'checkboxfield',
                        padding: '0 5 0 5',
                        inputValue: 'yes',
                        uncheckedValue: 'no'
                    },
                    items: [
                        {
                            boxLabel: 'Author',
                            name: 'print[author]',
                            checked: true
                        },
                        {
                            boxLabel: 'Teachers List',
                            name: 'print[teachers]',
                            checked: true
                        },
                        {
                            boxLabel: 'Section Notes',
                            name: 'print[section_notes]',
                            checked: true
                        },
                        {
                            boxLabel: 'Notes/Comments',
                            name: 'print[notes]',
                            checked: true
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
