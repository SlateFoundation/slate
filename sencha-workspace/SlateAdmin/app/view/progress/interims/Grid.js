/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.interims.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.grid.column.Date',
        'Ext.grid.feature.Grouping',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox'
    ],

    viewConfig: {
        getRowClass: function (record) {
            return 'status-'+record.get('Status');
        },
        emptyText: 'You are not currently an instructor for any students'
    },
    initComponent: function () {
    //	The scope of getFragmentHeader is the domwindow so for now we use initComponent to pass scope through getSectionTitle

        var me = this;

        me.features = [{
            ftype: 'grouping',
            groupHeaderTpl: [
                '{[this.getSectionTitle(values.rows[0])]} <span class="grades-summary">{[this.getReportsSummary(values.rows)]}</span>',
                {
                    getSectionTitle: Ext.bind(function (interim) {
                        console.log(interim);
                        return interim.get('Section').Title;
                    }),
                    getReportsSummary: function (studentRows) {
                        var statusFrequencies = {},
                            gridView = me.getView();


                        Ext.each(studentRows, function (studentRow) {

                            var status = gridView.getRowClass(studentRow).substr(7);

                            if(statusFrequencies[status]){
                                statusFrequencies[status]++;
                            } else {
                                statusFrequencies[status] = 1;
                            }
                        });

                        var summary = '';

                        if(statusFrequencies.Published && statusFrequencies.Draft) {
                            summary = statusFrequencies.Published + ' (+' + statusFrequencies.Draft + ' draft' + (statusFrequencies.Draft>1?'s':'')+')';
                        } else if (statusFrequencies.Published) {
                            summary = statusFrequencies.Published + ' reports';
                        } else if (statusFrequencies.Draft) {
                            summary = statusFrequencies.Draft + ' draft' + (statusFrequencies.Draft>1?'s':'');
                        }
                        return summary;
                    }
                }
            ],
            enableGroupingMenu: false
        }];

        me.store = 'progress.Interims';
        me.callParent(arguments);
    },
    componentCls: 'progress-interims-grid',
    tbar: [{
        xtype: 'toolbar',
        width: '40%',
        items: [{
            xtype: 'combobox',
            valueField: 'ID',
            queryMode: 'local',
            flex: 1,
            itemId: 'termSelector',
            action: 'termSelector',
            displayField: 'Title',
            store: 'Terms'
        }]
    }],
    columns: [{
        header: 'Section / Students',
        id: 'progress-interims-column-student',
        xtype: 'templatecolumn',
        tpl: '<tpl for="Student">{LastName}, {FirstName}</tpl>',
        flex: 1,
        sortable: false
    },{
        header: 'Grades',
        id: 'progress-interims-column-grade',
        dataIndex: 'Grade'
    },{
        header: 'Last Saved',
        id: 'progress-interims-column-saved',
        dataIndex: 'Saved',
        renderer: function(v, m, r) {
            if(!r.get('Saved')) {
                return 'Unsaved';
            }

            return Ext.Date.format(v, '<\\t\\i\\m\\e \\d\\a\\t\\e\\t\\i\\m\\e="c" \\t\\i\\t\\l\\e="Y-m-d h:i:s">M d g:ia</\\t\\i\\m\\e>');
        }
//        ,format: '<\\t\\i\\m\\e \\d\\a\\t\\e\\t\\i\\m\\e="c" \\t\\i\\t\\l\\e="Y-m-d h:i:s">M d g:ia</\\t\\i\\m\\e>'
    }]
});
