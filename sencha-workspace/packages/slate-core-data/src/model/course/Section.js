Ext.define('Slate.model.course.Section', {
    extend: 'Ext.data.Model',
    alternateClassName: [
        'Slate.model.CourseSection'
    ],
    requires: [
        'Slate.proxy.courses.Sections',
        'Ext.data.identifier.Negative'
    ],


    // model config
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
            defaultValue: 'Slate\\Courses\\Section'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'CourseID',
            type: 'int'
        },
        {
            name: 'Title',
            type: 'string'
        },
        {
            name: 'Code',
            type: 'string'
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'Live'
        },
        {
            name: 'Notes',
            type: 'string',
            allowNull: true
        },
        {
            name: 'StudentsCapacity',
            type: 'int',
            allowNull: true
        },
        {
            name: 'TermID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'ScheduleID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'LocationID',
            type: 'int',
            allowNull: true
        }
    ],

    proxy: 'slate-courses-sections'
});