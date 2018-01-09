Ext.define('SlateAdmin.model.person.progress.NoteRecipient', {
    extend: 'Ext.data.Model',


    groupField: 'RelationshipGroup',

    fields: [
        {
            name: 'PersonID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'FullName',
            type: 'string'
        },
        {
            name: 'Email',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Label',
            type: 'string',
            convert: function (v) {
                return v || 'Custom';
            }
        },
        {
            name: 'RelationshipGroup',
            convert: function (v) {
                return v || 'Other';
            }
        },

        // virtual fields
        {
            name: 'selected',
            type: 'boolean',
            convert: function (v, record) {
                var selected = !Ext.isEmpty(record.get('Status'));

                return selected;
            }
        }
    ],

    proxy: {
        type: 'slaterecords',
        startParam: null,
        limitParam: null,
        api: {
            read: '/notes/progress/recipients',
            update: '/notes/save',
            create: '/notes/save',
            destory: '/notes/save'
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json',
            rootProperty: 'data',
            writeAllFields: false,
            allowSingle: false
        }
    }
});
