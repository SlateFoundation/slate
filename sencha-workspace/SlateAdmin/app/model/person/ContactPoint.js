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
            useNull: true
        },
        {
            name: 'Class',
            type: 'string'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            useNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            useNull: true,
            persist: false
        },
        {
            name: 'PersonID',
            type: 'int',
            useNull: true
        },
        {
            name: 'Label',
            type: 'string',
            useNull: true
        },
        {
            name: 'Data',
            type: 'string',
            useNull: true
        },
        {
            name: 'String',
            type: 'string',
            useNull: true
        },
        {
            name: 'Primary',
            type: 'boolean',
            persist: false
        }
    ],

    validations: [
        {
            type: 'presence',
            field: 'Class'
        },
        {
            type: 'presence',
            field: 'PersonID'
        },
        {
            type: 'presence',
            field: 'Label'
        }
    ],

    proxy: {
        type: 'slaterecords',
        url: '/contact-points',
        startParam: false,
        limitParam: false,
        sortParam: false,
        include: ['String', 'Primary'],
        relatedTable: ['Person']
    },
    
    validate: function() {
        var me = this,
            errors = me.callParent(arguments);
        
        if (errors.isValid()) {
            if (!me.get('String') && !me.get('Data')) {
                errors.add({field: 'String', message: 'Contact point data cannot be empty'});
            }
        }
        
        return errors;
    }
});
