Ext.define('Slate.model.course.SectionParticipant', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.courses.SectionParticipants',
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
            defaultValue: 'Slate\\Courses\\SectionParticipant'
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
            name: 'CourseSectionID',
            type: 'int'
        },
        {
            name: 'PersonID',
            type: 'int'
        },
        {
            name: 'Person'
        },
        {
            name: 'Role',
            type: 'string'
        },
        {
            name: 'StartDate',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'EndDate',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'Cohort',
            type: 'string',
            allowNull: true
        },

        // virtual fields
        {
            name: 'PersonFirstName',
            mapping: 'Person.FirstName'
        },
        {
            name: 'PersonLastName',
            mapping: 'Person.LastName'
        },
        {
            name: 'PersonFullName',
            calculate: function(data) {
                return data.PersonFirstName + ' ' + data.PersonLastName;
            }
        },
        {
            name: 'isInactive',
            persist: false,
            depends: ['StartDate', 'EndDate'],
            convert: function(v, rec) {
                var start = rec.get('StartDate'),
                    end = rec.get('EndDate');

                return Boolean(
                    (start && start.getTime() > Date.now()) ||
                    (end && end.getTime() < Date.now())
                );
            }
        }
    ],

    proxy: 'slate-courses-participants'
});