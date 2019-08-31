/**
 * Ext.app.route.Router attaches onStateChange to the change event
 * by reference instead of by name, which prevents overrides of onStateChange
 * from working when it gets invoked from the change event
 *
 * Discussion: https://www.sencha.com/forum/showthread.php?304938
 * Fiddle: https://fiddle.sencha.com/#fiddle/1c45
 */
Ext.define('Jarvus.hotfixes.app.route.RouterOverridable', {
    override: 'Ext.app.route.Router'
}, function(Router) {
    var History = Ext.util.History;
    History.un('change', Router.onStateChange, Router);
    History.on('change', 'onStateChange', Router);
});