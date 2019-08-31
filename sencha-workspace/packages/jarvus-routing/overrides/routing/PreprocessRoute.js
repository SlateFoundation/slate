/**
 * Add beforeroute app event that can be cancelled to rewrite and/or asynchronously resume route handling
 */
Ext.define('Jarvus.routing.PreprocessRoute', {
    override: 'Ext.app.route.Router',
    requires: [
        'Jarvus.hotfixes.app.route.RouterOverridable'
    ],


    onStateChange: function (originalToken) {
        var me = this,
            thisMethod = arguments.callee,
            resume = function(resumeToken) {
                thisMethod.$owner.prototype[thisMethod.$name].call(me, resumeToken);
            };

        if (false !== me.application.fireEvent('beforeroute', originalToken, resume)) {
            resume(originalToken);
        }
    }
});