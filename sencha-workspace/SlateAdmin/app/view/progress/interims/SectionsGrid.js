Ext.define('SlateAdmin.view.progress.interims.SectionsGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'progress-interims-sectionsgrid',
    requires: [
        'Ext.grid.column.Template',
        'Ext.toolbar.Spacer',
        'Ext.button.Button'
    ],


    width: 250,
    store: 'progress.interims.Sections',
    componentCls: 'progress-interims-grid',
    tbar: [
        {
            xtype: 'button',
            text: 'My classes only',
            action: 'myClassesToggle',
            enableToggle: true
        },
        {
            xtype: 'tbspacer'
        },
        {
            itemId: 'termSelector',
            flex: 1,

            xtype: 'combobox',

            queryMode: 'local',
            store: 'Terms',
            valueField: 'Handle',
            displayField: 'Title',
            forceSelection: true
        }
    ],
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
    }]
});
