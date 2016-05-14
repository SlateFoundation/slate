/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Slate.store.TermReports', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.TermReport',

    config: {
        pageSize: 0
    }
});