Ext.define('SlateAdmin.model.progress.Email', {
    extend: 'Ext.data.Model',


    fields: [
        {
            name: 'student'
        },
        {
            name: 'sortName',
            mapping: ['student'],
            convert: function(v) {
                return v.LastName + ', ' + v.FirstName;
            }
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
