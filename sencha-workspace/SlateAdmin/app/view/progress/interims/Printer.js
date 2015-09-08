/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.Printer', {
    extend: 'Ext.container.Container',
    xtype: 'progress-interims-printer',
    requires: [
        'Ext.layout.container.VBox',
        'Ext.layout.container.HBox',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.form.field.ComboBox',
        'Ext.util.Cookies'
    ],

    componentCls: 'progress-interims-printer',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    initComponent: function () {

        this.items = [{
            xtype: 'form',
            itemId: 'filterForm',
            bodyPadding: 5,
            items: [{
                xtype: 'fieldset',
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
                items: [{
                    name: 'termID',
                    fieldLabel: 'Term',
                    emptyText: 'Current Term',
                    displayField: 'Title',
                    queryMode: 'local',
                    value: window.currentTerm,
                    forceSelection: false,
                    valueField: 'ID',
                    store: 'Terms'
                },{
                    name: 'advisorID',
                    fieldLabel: 'Advisor',
                    emptyText: 'Any',
                    displayField: 'FullName',
                    queryMode: 'local',
                    typeAhead: true,
                    store: 'people.Advisors'
                },{
                    name: 'authorID',
                    fieldLabel: 'Author',
                    emptyText: 'Any',
                    displayField: 'FullName',
                    typeAhead: true,
                    store: {
                        autoLoad: true,
                        fields: [
                            {name: 'ID', type: 'int'},
                            {
                                name: 'FullName',
                                convert: function (v, r) {
                                    return r.raw.LastName + ', ' + r.raw.FirstName;
                                }
                            }
                        ],
                        proxy: {
                            type: 'ajax',
                            url: '/interims/json/authors',
                            reader: {
                                type: 'json',
                                rootProperty: 'data'
                            }
                        }
                    }
                },{
                    name: 'studentID',
                    fieldLabel: 'Student',
                    emptyText: 'All',
                    queryMode: 'remote',
                    queryParam: 'q',
                    hideTrigger: true,
                    store: 'progress.interims.People',
                    listConfig: {
                        getInnerTpl: function () {
                            return '{LastName}, {FirstName}'
                        }
                    },
                    displayTpl: '<tpl for=".">{LastName}, {FirstName}</tpl>',
                    listeners: {
                        beforequery: function (qe) {
                            if(!qe) {
                                return false;
                            } else {
                                qe.query += ' class:Student';
                            }
                        }
                    }
                }]
            }]
            ,bbar: [{
                xtype: 'tbfill'
            },{
                text: 'Preview',
                action: 'preview'
            },{
                text: 'Print',
                action: 'print'
            },{
                text: 'Save to CSV',
                action: 'save-csv'
            },{
                xtype: 'tbseparator'
            },{
                text: 'Clear Filters',
                action: 'clear-filters'
            },{
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
                scope: this,
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
        }];

        this.callParent();
    },


    //helper functions
    loadEmailPreview: function (params) {
        var previewBox = this.getComponent('previewBox');
        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading Email Preview&hellip;'});
        previewBox.iframeEl.dom.src = '/interims/email/preview?'+Ext.Object.toQueryString(params);
    },

    loadPreview: function (params) {
        var previewBox = this.getComponent('previewBox');

        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});

    SlateAdmin.API.request({
            url: '/interims/print/preview',
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
            previewBox = me.getComponent('previewBox'),
            printLoadingInterval;

        params.downloadToken = Math.random();

        if(!SlateAdmin.API.getHost()) {
            printLoadingInterval = setInterval(function () {
                if(Ext.util.Cookies.get('downloadToken') == params.downloadToken) {
                    clearInterval(printLoadingInterval);
                    filterForm.setLoading(false);
                }
            }, 500);

            filterForm.setLoading({msg: 'Preparing PDF, please wait, this may take a minute&hellip;'});
        }

        previewBox.iframeEl.dom.src  = SlateAdmin.API.buildUrl('/interims/print?'+Ext.Object.toQueryString(params));
    },

    downloadCsv: function (params) {
        var me = this,
            filterForm = me.getComponent('filterForm'),
            previewBox = me.getComponent('previewBox'),
            apiHost = SlateAdmin.API.getHost(),
            csvLoadingInterval;

        params.downloadToken = Math.random();

        if(Ext.isEmpty(apiHost)) {
            csvLoadingInterval = setInterval(function() {
                if (Ext.util.Cookies.get('downloadToken') == params.downloadToken) {
                    clearInterval(csvLoadingInterval);
                    filterForm.setLoading(false);
                }
            }, 500);

            filterForm.setLoading({msg: 'Preparing CSV, please wait, this may take a minute&hellip;'});
        }

        previewBox.iframeEl.dom.src  = (apiHost ? 'http://' + apiHost : '') + '/interims/csv?'+Ext.Object.toQueryString(params);
    }
});
