Ext.define('SlateAdmin.proxy.API', {
    extend: 'Jarvus.proxy.API',
    alias: 'proxy.slateapi',

    config: {
        include: null
    },

    connection: 'SlateAdmin.API'
});