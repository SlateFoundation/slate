/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.proxy.API', {
    extend: 'Emergence.proxy.API',
    alias: 'proxy.slateapi',

    config: {
        include: null
    },

    connection: 'SlateAdmin.API'
});