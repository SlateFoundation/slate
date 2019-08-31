/*jslint browser: true, undef: true*//*global Ext,Jarvus*/

/**
 * This class implement an event domain for API wrappers. It was based on Ext.app.domain.Global
 * 
 * After requiring this class into an app or controller, you can use Controller's `listen` config
 * to catch events fired on your API singleton via the "api" domain
 */
Ext.define('Jarvus.util.APIDomain', {
    extend: 'Ext.app.EventDomain',
    singleton: true,
    requires: [
        'Jarvus.util.AbstractAPI'
    ],

    type: 'api',
    
    constructor: function() {
        var me = this;
        
        me.callParent();
        me.monitor(Jarvus.util.AbstractAPI);
    },
           
    listen: function(listeners, controller) {
        return this.callParent([{'*': listeners}, controller]);
    },

    match: Ext.returnTrue
});