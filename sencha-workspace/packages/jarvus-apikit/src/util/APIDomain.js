/*jslint browser: true, undef: true*//*global Ext,Jarvus*/

/**
 * This class implement an event domain for API wrappers. It was based on Ext.app.domain.Global
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