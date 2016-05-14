/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.narratives.Reports', {
    extend: 'Slate.store.TermReports',


    config: {
        autoLoad: false,
        autoSync: false,
        remoteFilter: true
    }
});
