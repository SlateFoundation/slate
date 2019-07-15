/**
 * Slate records proxy
 */
Ext.define('Slate.proxy.Records', {
    extend: 'Emergence.proxy.Records',
    alias: 'proxy.slate-records',
    requires: [
        'Slate.API'
    ],


    connection: 'Slate.API'
});