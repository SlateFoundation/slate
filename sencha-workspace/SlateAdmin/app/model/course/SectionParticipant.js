Ext.define('SlateAdmin.model.course.SectionParticipant', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        {
            name: "ID",
            type: "int",
            allowNull: true,
            persist: false
        },
        {
            name: "Class",
            type: "string",
            defaultValue: "Slate\\Courses\\SectionParticipant"
        },
        {
            name: "Created",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true,
            persist: false
        },
        {
            name: "CreatorID",
            type: "int",
            allowNull: true,
            persist: false
        },
        {
            name: "CourseSectionID",
            type: "int"
        },
        {
            name: "PersonID",
            type: "int"
        },
        {
            name: "Role",
            type: "string",
            values: ['Teacher', 'Assistant', 'Student', 'Observer']
        },
        {
            name: "StartDate",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true
        },
        {
            name: "EndDate",
            type: "date",
            dateFormat: "timestamp",
            allowNull: true
        },
        {
            name: "Cohort",
            type: "string",
            allowNull: true
        },
        {
            name: "Person",
            persist: false
        },
        {
            name: 'PersonFirstName',
            mapping: 'Person.FirstName',
            persist: false
        },
        {
            name: 'PersonLastName',
            mapping: 'Person.LastName',
            persist: false
        },
        {
            name: 'PersonUsername',
            mapping: 'Person.Username',
            persist: false
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/section-participants',
        startParam: false,
        limitParam: false,
        pageParam: false,
        extraParams: {
            include: 'Person'
        }
    },
});