/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.person.ContactPoint', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',

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
        Label: 'presence'
    },

    proxy: {
        type: 'slaterecords',
        url: '/contact-points',
        startParam: false,
        limitParam: false,
        sortParam: false,
        include: ['String', 'Primary'],
        relatedTable: ['Person']
    },

    getValidation: function() {
        var me = this,
            validation = me.callParent(arguments);

        if (validation.isValid()) {
            if (!me.get('String') && !me.get('Data')) {
                validation.set('String','Contact point data cannot be empty');
            }
        }
        return validation;
    }
});
