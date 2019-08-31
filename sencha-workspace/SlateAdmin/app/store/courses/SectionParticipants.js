Ext.define('SlateAdmin.store.courses.SectionParticipants', {
    extend: 'Ext.data.Store',


    /* global SlateAdmin */
    model: 'SlateAdmin.model.course.SectionParticipant',
    config: {
        autoSync: true,
        grouper: {
            property: 'Role',
            sortProperty: 'Role',
            transform: function(role) {
                return SlateAdmin.model.course.SectionParticipant.getField('Role').values.indexOf(role);
            }
        },
        sorters: [{
            property: 'PersonLastName',
            direction: 'ASC'
        }, {
            property: 'PersonFirstName',
            direction: 'ASC'
        }]
    }
});