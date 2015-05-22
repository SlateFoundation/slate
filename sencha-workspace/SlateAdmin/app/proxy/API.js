/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.proxy.API', {
    extend: 'Jarvus.ext.proxy.API',
    alias: 'proxy.slateapi',
    
    connection: 'SlateAdmin.API'
});