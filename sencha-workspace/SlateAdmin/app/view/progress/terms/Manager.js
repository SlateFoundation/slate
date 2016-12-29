Ext.define('SlateAdmin.view.progress.terms.Manager', {
    extend: 'Ext.Container',
    xtype: 'progress-terms-manager',
    requires: [
        'SlateAdmin.view.progress.terms.SectionsGrid',
        'SlateAdmin.view.progress.terms.StudentsGrid',
        'SlateAdmin.view.progress.terms.EditorForm',
        'SlateAdmin.view.progress.SectionNotesForm'
    ],


    layout: 'border',
    componentCls: 'progress-terms-manager',
    items: [
        {
            region: 'west',
            weight: 100,
            split: true,

            xtype: 'progress-terms-sectionsgrid'
        },
        {
            region: 'center',

            xtype: 'progress-terms-studentsgrid',
            disabled: true
        },
        {
            region: 'east',
            split: true,
            weight: 100,
            flex: 1,

            xtype: 'progress-terms-editorform',
            disabled: true
        },
        {
            region: 'south',
            split: true,

            xtype: 'progress-sectionnotesform',
            fieldName: 'TermReportNotes',
            collapsible: true,
            collapsed: true,
            titleCollapse: true,
            stateful: true,
            stateId: 'progress-terms-sectionnotesform',
            disabled: true
        }
    ]
});