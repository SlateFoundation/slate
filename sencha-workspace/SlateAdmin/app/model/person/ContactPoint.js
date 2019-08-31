/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.ContactPoint', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records',
        'Ext.data.identifier.Negative',
        'Ext.data.validator.Presence',
        'SlateAdmin.validator.CallbackValidator'
    ],

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
            type: 'string'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true,
            persist: false
        },
        {
            name: 'PersonID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Label',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Data',
            type: 'string',
            allowNull: true
        },
        {
            name: 'String',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Primary',
            type: 'boolean',
            persist: false
        }
    ],

    validators: {
        Class: 'presence',
        PersonID: 'presence',
        Label: 'presence',
        Data: {
            type: 'callback',
            message: 'Contact point data cannot be empty',
            callback: function(val, rec) {
                return (rec.get('String') || rec.get('Data'));
            }
        },
        String: {
            type: 'callback',
            message: 'Contact point data cannot be empty',
            callback: function(val, rec) {
                return (rec.get('String') || rec.get('Data'));
            }
        }
    },

    proxy: {
        type: 'slaterecords',
        url: '/contact-points',
        startParam: false,
        limitParam: false,
        sortParam: false,
        include: ['String', 'Primary'],
        relatedTable: ['Person']
    }
});
