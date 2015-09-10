/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.Grid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-grid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.Spacer',
        'Ext.grid.plugin.CellEditing',
        'Ext.button.Button'
    ],

    store: 'progress.narratives.WorksheetAssignments',
    componentCls: 'progress-narratives-grid',
    plugins: [{
        ptype: 'cellediting',
        clicksToEdit: 2,
        pluginId: 'narrativeAssignmentEditing'
    }],
    tbar: [{
        xtype: 'button',
        text: 'My classes only',
        action: 'myClassesToggle',
        enableToggle: true,
        pressed: true
    },{
        xtype: 'tbspacer'
    },{
        xtype: 'combo',
        valueField: 'ID',
        queryMode: 'local',
        flex: 1,
        itemId: 'termSelector',
        displayField: 'Title',
        store: 'Terms'
    }],
    columns: [{
        header: 'Section',
        dataIndex: 'CourseSection',
        width: 70,
        renderer: function (v) {
            return '<a href="/sections/'+v.Handle+'" target="_blank" title="'+v.Title+'">'+v.Code+'</a>';
        }
    },{

        header: 'Worksheet',
        flex: 1,
        dataIndex: 'WorksheetID',
        field: {
            xtype: 'combo',
            store: {
                fields: ['ID', 'Title', 'Handle'],
                proxy:{
                    type: 'ajax',
                    url: '/standards/json/worksheets',
                    limitParam: false,
                    pageParam: false,
                    startParam: false,
                    reader: {
                        rootProperty: 'data',
                        type: 'json'
                    }
                }
            },
            displayField: 'Title',
            valueField: 'ID',
            triggerAction: 'all',
            typeAhead: true,
            forceSelection: true,
            selectOnFocus: true,
            allowBlank: false,
            emptyText: 'Select worksheet'
        },
        renderer: function (v, metaData,r) {
            if(v) {
                var worksheet = r.get('Worksheet');
                if(worksheet) {
                    return r.get('Worksheet').Title;
                } else {
                    metaData.css = 'x-form-empty-field';
                    return '[Disabled Worksheet]';
                }
            } else {
                metaData.css = 'x-form-empty-field';
                return 'Double-click to assign worksheet';
            }
        }
    }]
});
