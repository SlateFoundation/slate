/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Slate records proxy
 */
Ext.define('SlateAdmin.proxy.Records', {
    extend: 'Emergence.ext.proxy.Records',
    alias: 'proxy.slaterecords',

    connection: 'SlateAdmin.API'
});

