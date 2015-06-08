/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.asset.Status', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],
    // model config
    idProperty: 'ID',
    
    fields: [
        'Handle',
        {
            name: 'ID',
            type: 'integer'
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
            name: 'Title',
            type: 'string'
        }, {
            name: 'ParentID',
            type: 'integer',
            useNull: true
        }, {
            name: 'Parent',
            useNull: true
        }, {
            name: 'Left',
            type: 'integer',
            persist: false,
            useNull: true
        }, {
            name: 'Status',
            type: 'string',
            defaultValue: 'Active'
        }, {
            name: 'Right',
            type: 'integer',
            persist: false,
            useNull: true
        }, {
            name: 'text',
            type: 'string',
            persist: false,
            convert: function(v, r) {
                return v || r.get('Title');
            }
        }, {
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
        }
    ],
    
    
    validations: [{
        type: 'presence',
        field: 'Title'
    }],

    proxy: {
        type: 'slaterecords',
        url: '/assets/statuses'
    }
});