Ext.define('SlateAdmin.view.progress.interims.Manager', {
    extend: 'Ext.Container',
    xtype: 'progress-interims-manager',
    requires: [
        'SlateAdmin.view.progress.interims.SectionsGrid',
        'SlateAdmin.view.progress.interims.StudentsGrid',
        'SlateAdmin.view.progress.interims.EditorForm',
        'SlateAdmin.view.progress.SectionNotesForm'
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
        },
        {
            region: 'south',
            split: true,

            xtype: 'progress-sectionnotesform',
            fieldName: 'InterimReportNotes',
            collapsible: true,
            collapsed: true,
            titleCollapse: true,
            stateful: true,
            stateId: 'progress-interims-sectionnotesform',
            disabled: true
        }
    ]
});