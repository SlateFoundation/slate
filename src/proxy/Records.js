/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Slate records proxy
 */
Ext.define('Slate.proxy.Records', {
    extend: 'Emergence.proxy.Records',
    alias: 'proxy.slate-records',

    connection: 'Slate.API'
});