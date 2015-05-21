/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Viewport', {
    extend: 'Ext.app.Controller',


    // controller config
    refs: [{
        ref: 'viewport',
        selector: 'viewport'
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
    },


    // controller methods
    loadCard: function(card) {
        var ct = this.getCardCt(),
            layout = ct.getLayout();

        if(layout.getActiveItem() !== card) {
            layout.setActiveItem(card);
            ct.remove(layout.getPrev());
        }
    }
});