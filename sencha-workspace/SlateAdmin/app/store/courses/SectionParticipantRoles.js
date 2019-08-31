Ext.define('SlateAdmin.store.courses.SectionParticipantRoles', {
    extend: 'Ext.data.Store',
    requires: [
        /* global SlateAdmin */
        'SlateAdmin.model.course.SectionParticipant'
    ],


    fields: [
        'Role'
    ],

    constructor: function() {
        this.callParent(arguments);

        this.setData(Ext.Array.map(SlateAdmin.model.course.SectionParticipant.getField('Role').values, function(Role) {
            return {
                Role: Role
            };
        }));
    }
});