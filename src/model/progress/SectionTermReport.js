Ext.define('Slate.model.progress.SectionTermReport', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.progress.SectionTermReports',
        'Ext.data.identifier.Negative'
    ],


    idProperty: 'ID',
    identifier: 'negative',

    fields: [
        {
            name: 'ID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Class',
            type: 'string',
            defaultValue: 'Slate\\Progress\\SectionTermReport'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true,
            persist: false
        },
        {
            name: 'Modified',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'ModifierID',
            type: 'int',
            allowNull: true,
            persist: false
        },
        {
            name: 'StudentID',
            type: 'int'
        },
        {
            name: 'SectionID',
            type: 'int'
        },
        {
            name: 'TermID',
            type: 'int'
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'draft'
        },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'NotesFormat',
            type: 'string',
            defaultValue: 'markdown'
        },


        // virtual fields
        {
            name: 'StudentFirstName',
            type: 'string',
            allowNull: true,
            mapping: 'Student.FirstName'
        },
        {
            name: 'StudentLastName',
            type: 'string',
            allowNull: true,
            mapping: 'Student.LastName'
        },

        // local-only fields
        {
            name: 'student',
            persist: false
        },
        {
            name: 'section',
            persist: false
        },
        {
            name: 'term',
            persist: false
        }
    ],

    proxy: 'slate-progress-reports-section-term'
});