Ext.define('SlateAdmin.model.person.progress.ProgressNote', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.identifier.Negative'
    ],


    idProperty: 'ID',
    identifier: 'negative',
    fields: [

        // writable fields
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            defaultValue: 'Slate\\Progress\\Note'
        },
        {
            name: 'ContextClass',
            defaultValue: 'Emergence\\People\\Person'
        },
        {
            name: 'ContextID',
            type: 'integer'
        },
        {
            name: 'Subject',
            type: 'string',
            allowBlank: false
        },
        {
            name: 'Message',
            type: 'string',
            allow: false
        },
        {
            name: 'MessageFormat',
            defaultValue: 'html'
        },
        {
            name: 'ParentMessageID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'Status',
            allowNull: true
        },

        // dynamic fields
        {
            name: 'Timestamp',
            type: 'date',
            dateFormat: 'timestamp',
            persist: false
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/notes',
        include: ['Author']
    }
});
