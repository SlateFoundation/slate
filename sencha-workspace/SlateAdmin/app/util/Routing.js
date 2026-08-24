/**
 * Route-token encoding helpers for non-controller contexts.
 *
 * jarvus-routing's RouteEncoding override provides encodeRouteArray/
 * encodeRouteComponent on Ext.app.BaseController (and controllers should
 * use those directly, or just redirectTo with an array). Views building
 * hash hrefs inside templates have no controller scope, so this singleton
 * exposes the same implementation to them — replacing the retired local
 * Ext.util.History fork that carried a divergent copy.
 */
Ext.define('SlateAdmin.util.Routing', {
    singleton: true,

    /**
     * @param {Array} array Route components; each is encoded, models via toUrl()
     * @return {String} Encoded route token
     */
    encodeRouteArray: function(array) {
        var proto = Ext.app.BaseController.prototype;

        return proto.encodeRouteArray(array);
    }
});
