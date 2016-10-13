Ext.define('SlateAdmin.model.progress.Email', {
    extend: 'Ext.data.Model',


    fields: [
        {
            name: 'student'
        },
        {
            name: 'firstName',
            mapping: 'student.FirstName'
        },
        {
            name: 'lastName',
            mapping: 'student.LastName'
        },
        {
            name: 'recipients'
        },
        {
            name: 'reports'
        },
        {
            name: 'emailBody'
        }
    ]
});
