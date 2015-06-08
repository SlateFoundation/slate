/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.model.Term', {
    extend: 'Ext.data.Model',
    requires: [
        'SlateAdmin.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [{
        name: "ID",
        type: "int",
        useNull: true
    }, {
        name: "Class",
        type: "string",
        defaultValue: "Slate\\Term"
    }, {
        name: "Created",
        type: "date",
        dateFormat: "timestamp",
        useNull: true
    }, {
        name: "CreatorID",
        type: "int",
        useNull: true
    }, {
        name: "RevisionID",
        type: "int",
        useNull: true
    }, {
        name: "Title",
        type: "string",
        useNull: true
    }, {
        name: "Handle",
        type: "string",
        useNull: true
    }, {
        name: "Status",
        type: "string",
        defaultValue: "Live"
    }, {
        name: "StartDate",
        type: "date",
        dateFormat: "Y-m-d",
        useNull: true
    }, {
        name: "EndDate",
        type: "date",
        dateFormat: "Y-m-d",
        useNull: true
    }, {
        name: "ParentID",
        type: "int",
        useNull: true
    }, {
        name: "Left",
        type: "int",
        useNull: true
    }, {
        name: "Right",
        type: "int",
        useNull: true
    },{
        name: 'namesPath',
        type: 'string',
        persist: false
    },{
        name: 'text',
        type: 'string',
        persist: false,
        convert: function(v, r) {
            return v || r.get('Title');
        }
    },{
        name: 'leaf',
        type: 'boolean',
        persist: false,
        convert: function(v, r) {
            if (typeof v == 'boolean') {
                return v;
            } else {
                return r.raw.Left == r.raw.Right - 1;
            }
        }
    }],
    
    validations: [{
        type: 'presence',
        field: 'Title'
    },{
        type: 'presence',
        field: 'StartDate'
    }, {
        type: 'presence',
        field: 'EndDate'
    }],

    proxy: {
        type: 'slaterecords',
        url: '/terms'
    }
});