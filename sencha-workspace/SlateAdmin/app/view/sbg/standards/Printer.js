/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.Printer', {
    extend: 'Ext.container.Container',
    xtype: 'sbg-standards-printer',
    requires: [
        'Ext.layout.container.VBox',
        'Ext.layout.container.HBox',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.util.Cookies'
    ],

    componentCls: 'sbg-standards-printer',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'form',
        itemId: 'filterForm',
        bodyPadding: 5,
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
                forceSelection: true,
                allowBlank: true,
                valueField: 'ID'
            },
            items: [{
                name: 'termID',
                fieldLabel: 'Term',
                emptyText: 'Current Term',
                displayField: 'Title',
                itemId: 'termSelector',
                action: 'termSelector',
                valueField: 'ID',
                queryMode: 'local',
                forceSelection: false,
                store: 'Terms'
            },{
                name: 'advisorID',
                xtype: 'combobox',
                fieldLabel: 'Advisor',
                emptyText: 'Any',
                displayField: 'FullName',
                queryMode: 'local',
                typeAhead: true,
                store: 'people.Advisors'
            },{
                name: 'studentID',
                fieldLabel: 'Student',
                emptyText: 'All',
                queryMode: 'remote',
                queryParam: 'q',
                hideTrigger: true,
                store: 'sbg.standards.People',
                listConfig: {
                    getInnerTpl: function () {
                        return '{LastName}, {FirstName}';
                    }
                },
                displayTpl: '<tpl for=".">{LastName}, {FirstName}</tpl>',
                listeners: {
                    beforequery: function (qe) {
                        if (!qe)
                            return false;
                        else
                            qe.query += ' class:Student';
                    }
                }
            }]
        }],
        bbar: [{
            xtype: 'tbfill'
        },{
            text: 'Preview',
            action: 'preview'
        },{
            text: 'Print',
            action: 'print'
        },{
            text: 'Email to Parents',
            action: 'email',
            disabled: true
        },{
            xtype: 'tbseparator'
        },{
            text: 'Clear Filters',
            action: 'clear-filters'
        }, {
            xtype: 'tbfill'
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
    }],


    //helper functions
    loadPreview: function (params) {
        var previewBox = this.getComponent('previewBox');

        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});

        SlateAdmin.API.request({
            url: '/sbg/standards/print/preview',
            params: params,
            scope: this,
            success: function (res) {
                var previewBox = this.getComponent('previewBox'),
                    doc = document.getElementById(previewBox.iframeEl.dom.id).contentWindow.document;
                doc.open();
                doc.write(res.responseText);
                doc.close();
            }
        });
    },

    loadPrint: function (params) {
        var me = this,
            filterForm = me.getComponent('filterForm'),
            previewBox = me.getComponent('previewBox');

        filterForm.setLoading({msg: 'Preparing PDF, please wait, this may take a minute&hellip;'});
        SlateAdmin.API.downloadFile('/sbg/standards/print?'+Ext.Object.toQueryString(params), function () {
            filterForm.setLoading(false);
        });

        setTimeout(function() {
            filterForm.setLoading(false);
        }, 1000);
    }
});
