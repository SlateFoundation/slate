/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.progress.narratives.SectionsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-narratives-sectionsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.form.field.ComboBox',
        'Ext.toolbar.Spacer',
        'Ext.grid.plugin.CellEditing',
        'Ext.button.Button'
    ],

    width: 250,
    store: 'progress.narratives.Sections',
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
        enableToggle: true
    },{
        xtype: 'tbspacer'
    },{
        itemId: 'termSelector',
        flex: 1,

        xtype: 'combobox',

        queryMode: 'local',
        store: 'Terms',
        valueField: 'Handle',
        displayField: 'Title',
        forceSelection: true
    }],
    columns: [{
        flex: 1,

        xtype: 'templatecolumn',

        text: 'Section',
        dataIndex: 'Code',
        tpl: [
            '<a href="{[SlateAdmin.API.buildUrl("/sections/" + values.Code)]}" target="_blank" title="{Title:htmlEncode}">',
                '{Code}',
            '</a>'
        ]
    // },{

    //     header: 'Worksheet',
    //     flex: 1,
    //     dataIndex: 'WorksheetID',
    //     field: {
    //         xtype: 'combo',
    //         store: {
    //             fields: ['ID', 'Title', 'Handle'],
    //             proxy:{
    //                 type: 'slateapi',
    //                 url: '/standards/worksheets',
    //                 limitParam: false,
    //                 pageParam: false,
    //                 startParam: false,
    //                 reader: {
    //                     rootProperty: 'data',
    //                     type: 'json'
    //                 }
    //             }
    //         },
    //         displayField: 'Title',
    //         valueField: 'ID',
    //         triggerAction: 'all',
    //         typeAhead: true,
    //         forceSelection: true,
    //         selectOnFocus: true,
    //         allowBlank: false,
    //         emptyText: 'Select worksheet'
    //     },
    //     renderer: function (v, metaData,r) {
    //         if(v) {
    //             var worksheet = r.get('Worksheet');
    //             if(worksheet) {
    //                 return r.get('Worksheet').Title;
    //             } else {
    //                 metaData.css = 'x-form-empty-field';
    //                 return '[Disabled Worksheet]';
    //             }
    //         } else {
    //             metaData.css = 'x-form-empty-field';
    //             return 'Double-click to assign worksheet';
    //         }
    //     }
    }]
});
