/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.person.progress.NoteRecipient', {
    extend: 'Ext.data.Model',
    
    idProperty: 'ID',
    groupField: 'RelationshipGroup',
    fields: [
        'FullName',
        'Email',
        'Label',
        'Status',
        {
            name: 'selected',
            type: 'boolean',
            convert: function (v, record) {
                var selected = !Ext.isEmpty(record.get('Status'));

                return selected;
            }
        }, {
            name: 'PersonID',
            type: 'integer'
        }, {
            name: 'RelationshipGroup',
            convert: function (v) {
                return v ? v : 'Other';
            }
        }, {
            name: 'ID',
            type: 'integer'
        }
    ],
    proxy: {
        type: 'slaterecords',
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
