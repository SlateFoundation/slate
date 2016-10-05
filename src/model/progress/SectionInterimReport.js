Ext.define('Slate.model.progress.SectionInterimReport', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Records',
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
            defaultValue: 'Slate\\Progress\\SectionInterimReport'
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

        // TODO: move to scienceleadership-interims package
        {
            name: 'Grade',
            type: 'string',
            allowNull: true
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

        // local-only fileds
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

    proxy: {
        type: 'slate-records',
        url: '/progress/section-interim-reports',
        limitParam: null,
        startParam: null
    }
});