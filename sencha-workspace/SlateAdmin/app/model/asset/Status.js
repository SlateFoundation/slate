/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.asset.Status', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    parentNode: null,

    // model config
    idProperty: 'ID',
    
    fields: [{
        name: 'ID',
        type: 'integer'
    },
    {
        name: 'Class',
        defaultValue: 'Slate\\Assets\\Asset'
    },
    {
        name: 'Created',
        type: 'date',
        dateFormat: 'timestamp',
        useNull: true
    },{
        name: 'Status',
        defaultValue: 'Active'
    },{
        name: 'CreatorID',
        type: 'integer',
        useNull: true
    },
    {
        name: 'Title',
        type: 'string'
    },
    {
        name: 'ParentID',
        type: 'integer',
        useNull: true
    },
    {
        name: 'Parent',
        useNull: true
    },
    {
        name: 'Left',
        type: 'integer',
        persist: false,
        useNull: true
    },
    {
        name: 'Right',
        type: 'integer',
        persist: false,
        useNull: true
    },
    {
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Title');
        }
    },
    {
        name: 'leaf',
        type: 'boolean',
        persist: false,
        convert: function(v, r) {
            if (typeof v == 'boolean') {
                return v;
            } else {
                return r.get('Left') == r.get('Right') - 1;
            }
        }
    },
    'Handle'],
    
//    associations: [{
//        type: 'hasMany',
//        name: 'Children',
//        model: 'SlateAdmin.model.asset.Status',
//        primaryKey: 'ID',
//        foreignKey: 'ParentID',
//        
//        associationKey: 'children'
//    }],
    
    validations: [
        
    ],

    proxy: {
        type: 'slaterecords',
        url: '/assets/statuses',
        
        include: 'assetsCount',
        
        reader: {
            type: 'json',
            root: 'data'
        },
        
        extraParams: {
            format: 'json',
            parentStatus : 'any',
            limit: false
        }
    }

    // model methods
    
});