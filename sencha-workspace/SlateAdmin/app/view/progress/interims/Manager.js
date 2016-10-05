Ext.define('SlateAdmin.view.progress.interims.Manager', {
    extend: 'Ext.Container',
    xtype: 'progress-interims-manager',
    requires: [
        'SlateAdmin.view.progress.interims.SectionsGrid',
        'SlateAdmin.view.progress.interims.StudentsGrid',
        'SlateAdmin.view.progress.interims.EditorForm'
    ],


    layout: 'border',
    componentCls: 'progress-interims-manager',
    items: [
        {
            region: 'west',
            weight: 100,
            split: true,

            xtype: 'progress-interims-sectionsgrid'
        },
        {
            region: 'center',

            xtype: 'progress-interims-studentsgrid',
            disabled: true
        },
        {
            region: 'east',
            split: true,
            weight: 100,
            flex: 1,

            xtype: 'progress-interims-editorform',
            disabled: true
        }
    ]
});