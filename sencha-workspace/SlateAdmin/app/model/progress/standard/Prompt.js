/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.standard.Prompt', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Ajax',
        'SlateAdmin.proxy.Records'
    ],

    idProperty: 'ID',
    fields: [
        'Prompt',
        'Status',
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
            name: 'WorksheetID',
            type: 'integer'
        }
    ],
    proxy: {
        type: 'slaterecords',
        url: '/standards/prompts',
        extraParams: {
            format: 'json'
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        },
        writer: {
            type: 'json',
            allowSingle: false,
            rootProperty: 'data'
        }
    }
});
