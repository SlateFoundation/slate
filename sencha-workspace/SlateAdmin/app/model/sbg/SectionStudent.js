/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.model.sbg.SectionStudent', {
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
            read: '/sbg/standards/section-students'
        },
        reader: {
            type: 'json',
            rootProperty: 'data'
        }
    }
});
