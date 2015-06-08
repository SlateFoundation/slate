/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.Printer', {
    extend: 'Ext.container.Container'    
    ,xtype: 'progress-narratives-printer'
    ,requires: [
        'Ext.layout.container.VBox'
        ,'Ext.layout.container.HBox'
        ,'Ext.form.Panel'
        ,'Ext.form.FieldSet'
        ,'Ext.form.field.ComboBox'
        ,'Ext.util.Cookies'
    ]
    ,componentCls: 'progress-narratives-printer'   
    ,layout: {
        type: 'vbox'
        ,align: 'stretch'
	}
	,items: [{
        xtype: 'form'
        ,itemId: 'filterForm'
        ,bodyPadding: 5
        ,items: [{
            xtype: 'fieldset'
            ,title: 'Filter reports by&hellip;'
            ,layout: 'hbox'
            ,padding: 10
            ,defaultType: 'combobox'
            ,defaults: {
                flex: 1
                ,labelAlign: 'right'
                ,labelWidth: 60
                ,forceSelection: false
                ,allowBlank: true
                ,valueField: 'ID'
            }
            ,items: [{
                name: 'termID'
                ,fieldLabel: 'Term'
                ,emptyText: 'Current Term'
                ,displayField: 'Title'
                ,itemId: 'termSelector'
                ,valueField: 'ID'
                ,value: window.reportingTerm
                ,queryMode: 'local'
                ,store: {
                    fields: [
                        'Title',{name: 'ID', type: 'integer'}
                    ]
                    ,autoLoad: true
                    ,proxy: {
                        type: 'ajax'
                        ,url: '/terms/json'
						,limitParam: false
						,pageParam: false
						,startParam: false
                        ,reader: {
                            type: 'json'
                            ,root: 'data'
                        }
                    }
                }
            },{
                name: 'advisorID'
                ,fieldLabel: 'Advisor'
                ,emptyText: 'Any'
                ,displayField: 'FullName'
                ,queryMode: 'local'
                ,typeAhead: true
                ,store: 'people.Advisors'
            },{
                name: 'studentID'
                ,fieldLabel: 'Student'
                ,emptyText: 'All'
                ,queryMode: 'remote'
                ,queryParam: 'q'
                ,hideTrigger: true
                ,store: 'progress.narratives.People'
                ,listConfig: {
                    getInnerTpl: function() {
                        return '{LastName}, {FirstName}';
                    }
                }
                ,displayTpl: '<tpl for=".">{LastName}, {FirstName}</tpl>'
                ,listeners: {
                    beforequery: function(qe) {
                        if(!qe)
                            return false;
                        else
                            qe.query += ' class:Student';
                    }
                }
            },{
                name: 'authorID'
                ,fieldLabel: 'Author'
                ,emptyText: 'Any'
                ,displayField: 'FullName'
                ,typeAhead: true
                ,store: {
                    autoLoad: true
                    ,fields: [
                        {name: 'ID', type: 'int'}
                        ,{
                            name: 'FullName'
                            ,convert: function(v, r) {
                                return r.raw.LastName + ', ' + r.raw.FirstName;
                            }
                        }
                    ]
                    ,proxy: {
                        type: 'ajax'
                        ,url: '/narratives/json/authors'
                        ,reader: {
                            type: 'json'
                            ,root: 'data'
                        }
                    }
                }
            }]
        }]
        ,bbar: [{
            xtype: 'tbfill'
        },{
            text: 'Preview'
            ,action: 'preview'
        },{
            text: 'Print to PDF'
            ,action: 'print-pdf'
        },{
            text: 'Print via Browser'
            ,action: 'print-browser'
        },{
            text: 'Email to Parents'
            ,action: 'email'
            ,disabled: true
        },{
            xtype: 'tbseparator'
        },{
            text: 'Clear Filters'
            ,action: 'clear-filters'
        },{
            xtype: 'tbfill'
        }]
	},{
        xtype: 'component'
        ,itemId: 'previewBox'
        ,cls: 'print-preview'
        ,flex: 1
        ,disabled: true
        ,renderTpl: '<iframe width="100%" height="100%"></iframe>'
        ,renderSelectors: {
            iframeEl: 'iframe'
        }
	}]

    
    
    // helper functions
    ,loadPreview: function(params, invokePrintDialog) {
        var previewBox = this.getComponent('previewBox')
        	,iframeEl = previewBox.iframeEl;
        
        previewBox.enable();
        previewBox.setLoading({msg: 'Downloading reports&hellip;'});
        iframeEl.dom.src = '/narratives/print/preview?'+Ext.Object.toQueryString(params);
        
        iframeEl.on('load', function() {
            this.fireEvent('previewload', this, previewBox);
            previewBox.setLoading(false);
            
            if (invokePrintDialog) {
            	iframeEl.dom.contentWindow.print();
            }
        }, this, { single: true, delay: 10 })
    }
    
    ,loadPrint: function(params) {
        var filterForm = this.getComponent('filterForm')
            ,previewBox = this.getComponent('previewBox');
            
        params.downloadToken = Math.random();
        
        
        filterForm.setLoading({msg: 'Preparing PDF, please wait, this may take a minute&hellip;'});
        
        var printLoadingInterval = setInterval(function() {
        
            if(Ext.util.Cookies.get('downloadToken') == params.downloadToken)
            {
                clearInterval(printLoadingInterval);
                filterForm.setLoading(false);
            }
        }, 500);
        
        // use iframe for loading, setting window.location cancels all current loading operations (like the ext loading spinner we just showed)
        previewBox.iframeEl.dom.src = '/narratives/print?'+Ext.Object.toQueryString(params);
    }

});
