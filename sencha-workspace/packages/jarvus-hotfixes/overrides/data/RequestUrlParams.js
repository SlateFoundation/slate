/**
 * Adds urlParams config to Ext.data.Request object to enable proxy
 * implementations to pass urlParams option to Ext.data.Connection.request()
 * via request instance.
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?303634
 */
Ext.define('Jarvus.hotfixes.data.RequestUrlParams', {
    override: 'Ext.data.Request',

    config: {
        urlParams: null
    }
});
