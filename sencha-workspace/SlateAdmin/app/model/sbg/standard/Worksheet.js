/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.sbg.standard.Worksheet', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Ajax',
        'SlateAdmin.model.person.Person',
        'SlateAdmin.proxy.Records',
        'Ext.data.validator.Presence'
    ],

    idProperty: 'ID',
    fields: [
        'Title',
        'Handle',
        'Description',
        'Status',
        {
            name: 'ID',
            type: 'integer',
            useNull: true
        }, {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true
        }, {
            name: 'CreatorID',
            type: 'integer',
            useNull: true
        }, {
            name: 'TotalPrompts',
            type: 'integer'
        }
    ],
    validators: [
        {
            type: 'presence',
            field: 'Title'
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/sbg/standards/worksheets',
        include: ['TotalPrompts'],
        extraParams: {
            format: 'json'
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json',
            writeAllFields: false,
            allowSingle: false,
            rootProperty: 'data'
        }
    }
});
