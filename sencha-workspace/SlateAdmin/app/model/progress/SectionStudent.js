/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.progress.SectionStudent', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Ajax',
        'SlateAdmin.proxy.Records'
    ],
    
    idProperty: 'ID'    ,
    fields: [
        'FirstName',
        'LastName',
        {
            name: 'ID',
            type: 'integer',
            useNull: true
        }, {
            name: 'PromptsGraded',
            type: 'integer'
        }
    ],
    proxy: {
        type: 'slaterecords',
        api:{ 
            read: '/standards/section-students'
        },
        extraParams: {
            format: 'json'
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    }
});
