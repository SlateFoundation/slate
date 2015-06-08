/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.person.progress.ProgressNote', {
    extend: 'Ext.data.Model',
    
    idProperty: 'ID',
    fields: [
        'Subject',
        {
            name: 'ID',
            type: 'integer',
            useNull: true,
            defaultValue: null
        }, {
            name: 'Class',
            defaultValue: 'Slate\\Progress\\Note'
        }, {
            name: 'ContextClass',
            defaultValue: 'Emergence\\People\\Person'
        }, {
            name: 'ContextID',
            type: 'integer'
        }, {
            name: 'AuthorID',
            type: 'integer',
            useNull: true,
            defaultValue: null,
            persist: false
        }, {
            name: 'Author',
            useNull: true,
            defaultValue: null,
            persist: false
        }, {
            name: 'Message',
            type: 'string',
            allowBlank: false
        }, {
            name: 'MessageFormat',
            defaultValue: 'html'
        }, {
            name: 'Status',
            useNull: true,
            defaultValue: null
        }, {
            name: 'Source',
            useNull: true,
            defaultValue: null
        }, {
            name: 'ParentMessageID',
            type: 'integer',
            useNull: true,
            defaultValue: null
        }, {
            name: 'Sent',
            type: 'date',
            dateFormat: 'timestamp'
        }
    ],
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json',
            root: 'data',
            writeAllFields: false,
            allowSingle: false
        },
        api: {
            read: '/notes/json',
            create: '/notes/json/save',
            update: '/notes/json/save',
            destroy: '/notes/json/destroy'
        }
    }
});
