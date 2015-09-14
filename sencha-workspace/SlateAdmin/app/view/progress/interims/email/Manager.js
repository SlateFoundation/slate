/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.email.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'progress-interims-email-manager',
 	requires: [
 		'SlateAdmin.view.progress.interims.email.Grid'
 	],

    componentCls: 'progress-interims-email-manager',
	layout: {
        type: 'vbox',
        align: 'stretch'
	},
	interim: null,
	items: [{
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
                        url: '/advisors/json',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    }
                }
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
                        url: '/people/json/',
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
                        return '{LastName}, {FirstName}';
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
            },{
				xtype: 'checkboxgroup',
				fieldLabel: 'Recipients',
				vertical: true,
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
        }],
        bbar: [{
			xtype: 'tbfill'
        },{
			xtype: 'button',
			text: 'Search',
			action: 'interim-email-search'
        },{
        	xtype: 'tbseparator'
        },{
            text: 'Clear Filters',
            action: 'clear-filters'
        },{
			xtype: 'tbfill'
        }]
	},{
		xtype: 'container',
		layout: {
			type: 'hbox',
			align: 'stretch'
		},
		flex: 1,
		items: [{
	        xtype: 'progress-interims-email-grid',
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
	}],

	loadStudentPreview: function (params) {
        var previewBox = this.down('#previewBox');
        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});
        previewBox.iframeEl.dom.src = '/interims/singleEmailPreview?'+Ext.Object.toQueryString(params);
    }
});
