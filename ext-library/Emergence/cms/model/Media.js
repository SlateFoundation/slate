/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.model.Media', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Ajax'
    ],

    idProperty: 'ID',

    fields: [{
        name: 'ID',
        type: 'integer'
    },{
        name: 'Class'
    },{
        name: 'Created',
        type: 'date',
        dateFormat: 'timestamp'
    },{
        name: 'CreatorID',
        type: 'integer'
    },{
        name: 'MIMEType'
    },{
        name: 'Width',
        type: 'integer'
    },{
        name: 'Height',
        type: 'integer'
    },{
        name: 'Caption'
    }],

    proxy: {
        type: 'ajax',
        api: {
            read:'/media/json',
            create:'/media/json/save',
            update:'/media/json/save'
        },
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: {
            type: 'json',
            writeAllFields: false,
            allowSingle: false,
            root: 'data'
        }
    }

});