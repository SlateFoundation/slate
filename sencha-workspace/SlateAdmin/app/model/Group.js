/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Group', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',

    fields: [{
        name: 'ID',
        type: 'integer',
        useNull: true
    },{
        name: 'Class',
        defaultValue: 'Group'
    },{
        name: 'Created',
        type: 'date',
        dateFormat: 'timestamp',
        useNull: true
    },{
        name: 'CreatorID',
        type: 'integer',
        useNull: true
    },{
        name: 'Handle',
        type: 'string',
        useNull: true
    },{
        name: 'Name',
        type: 'string',
        useNull: true
    },{
        name: 'Status',
        type: 'string',
        defaultValue: 'Active'
    },{
        name: 'Data',
        useNull: true
    },{
        name: 'Population',
        type: 'integer',
        persist: false,
        defaultValue: 0
    },{
        name: 'ParentID',
        type: 'integer',
        useNull: true
    },{
        name: 'Left',
        type: 'integer',
        persist: false,
        useNull: true
    },{
        name: 'Right',
        type: 'integer',
        persist: false,
        useNull: true
    },{
        name: 'FullPath',
        convert: function(v,r){
            return '/' + v;
        }
    },{
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Name');
        }
    },{
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
    }],

    proxy: {
        type: 'slaterecords',
        url: '/groups'
    }
});
