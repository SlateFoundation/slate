/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.Sections', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.proxy.Records'
    ],

    model: 'SlateAdmin.model.course.Section',
    pageSize: false,
    proxy: {
        type: 'slaterecords',
        url: '/sections'
    }
});
