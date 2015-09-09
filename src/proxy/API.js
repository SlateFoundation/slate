/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Slate.proxy.API', {
    extend: 'Jarvus.proxy.API',
    alias: 'proxy.slate-api',
    requires: [
        'Slate.API'
    ],

    connection: 'Slate.API'
});