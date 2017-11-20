Ext.define('SlateAdmin.view.progress.terms.print.Container', {
    extend: 'Ext.container.Container',
    xtype: 'progress-terms-print-container',
    requires: [
        'SlateAdmin.widget.field.Person',

        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Checkbox',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Separator'
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
                        valueField: 'ID'
                    },
                    items: [
                        {
                            name: 'term',
                            fieldLabel: 'Term',
                            emptyText: 'Current Term',

                            store: 'Terms',
                            displayField: 'Title',
                            valueField: 'Handle',

                            queryMode: 'local',
                            forceSelection: false
                        },
                        {
                            name: 'advisor',
                            fieldLabel: 'Advisor',
                            emptyText: 'Any',

                            store: 'Advisors',
                            displayField: 'SortName',
                            valueField: 'Username',

                            queryMode: 'local',
                            typeAhead: true,
                            forceSelection: false
                        },
                        {
                            name: 'author',
                            fieldLabel: 'Author',
                            emptyText: 'Any',

                            store: 'progress.terms.Authors',
                            displayField: 'SortName',
                            valueField: 'Username',

                            queryMode: 'local',
                            typeAhead: true,
                            forceSelection: false
                        },
                        {
                            xtype: 'slate-personfield',
                            name: 'student',
                            fieldLabel: 'Student',
                            emptyText: 'All',
                            appendQuery: 'class:student'
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

            xtype: 'component',
            itemId: 'printout',
            cls: 'print-preview',
            renderTpl: '<iframe width="100%" height="100%"></iframe>',
            renderSelectors: {
                iframeEl: 'iframe'
            },
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
