Ext.define('SlateAdmin.view.progress.interims.email.Container', {
    extend: 'Ext.container.Container',
    xtype: 'progress-interims-email-container',
    requires: [
        'SlateAdmin.widget.field.Person',
        'SlateAdmin.view.progress.interims.email.Grid',

        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.form.CheckboxGroup',
        'Ext.toolbar.Fill',
        'Ext.toolbar.Separator'
    ],


    // config: {
    //     interim: null
    // },

    componentCls: 'progress-interims-email-container',
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
                        valueField: 'ID'
                    },
                    items: [
                        {
                            name: 'term',
                            fieldLabel: 'Term',
                            emptyText: 'Current Term',
                            displayField: 'Title',
                            queryMode: 'local',
                            forceSelection: false,
                            valueField: 'ID',
                            store: 'Terms'
                        },
                        {
                            name: 'advisor',
                            fieldLabel: 'Advisor',
                            emptyText: 'Any',
                            displayField: 'SortName',
                            queryMode: 'local',
                            typeAhead: true,
                            store: 'Advisors'
                        },
                        {
                            name: 'author',
                            fieldLabel: 'Author',
                            emptyText: 'Any',
                            displayField: 'SortName',
                            queryMode: 'local',
                            typeAhead: true,
                            store: 'progress.interims.Authors'
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
                    xtype: 'fieldset',
                    itemId: 'recipientsFieldset',
                    title: 'Recipients',
                    layout: 'hbox',
                    padding: 10,
                    defaultType: 'checkbox',
                    defaults: {
                        name: 'recipients',
                        value: true
                    },
                    items: [
                        {
                            boxLabel: 'Advisor',
                            inputValue: 'advisor'
                        },
                        {
                            boxLabel: 'Parents',
                            inputValue: 'parents'
                        }
                    ]
                }
            ],
            bbar: [
                { xtype: 'tbfill' },
                {
                    xtype: 'button',
                    text: 'Search',
                    action: 'interim-email-search'
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
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            flex: 1,
            items: [
                {
                    xtype: 'progress-interims-email-grid',
                    width: 450
                },
                {
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
                }
            ]
        }
    ],

    loadStudentPreview: function (params) {
        var previewBox = this.down('#previewBox');

        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});
        previewBox.iframeEl.dom.src = SlateAdmin.API.buildUrl('/interims/singleEmailPreview?'+Ext.Object.toQueryString(params));
    }
});
