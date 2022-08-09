/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Viewport', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'Viewport'
    ],

    refs: [{
        ref: 'viewport',
        selector: 'viewport',
        autoCreate: true,

        xclass: 'SlateAdmin.view.Viewport'
    },{
        ref: 'navCt',
        selector: 'slateadmin-navigation'
    },{
        ref: 'cardCt',
        selector: 'container[itemId=cardCt]'
    }],


    // controller template methods
    onLaunch: function() {
        var me = this,
            viewport = me.getViewport(), // must be created before calling getNavCt
            navCt = me.getNavCt(),
            navPanels = [];

        // load navigation panels
        me.application.controllers.each(function(controller) {
            if (!controller.buildNavPanel) {
                return;
            }

            var navPanel = controller.buildNavPanel();

            if (navPanel && !(navPanel instanceof Ext.Component)) {
                navPanel = Ext.ComponentMgr.create(navPanel, 'panel');
            }

            if (navPanel) {
                navPanel.collapsed = true;
                navPanels.push(navPanel);
            }
        });

        navCt.add(navPanels);
        Ext.getBody().removeCls('loading');
    },


    // controller methods
    loadCard: function(card) {
        var ct = this.getCardCt(),
            layout = ct.getLayout();

        if (layout.getActiveItem() !== card) {
            layout.setActiveItem(card);
            ct.remove(layout.getPrev(), false);
        }
    }
});