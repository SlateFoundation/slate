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
    init: function() {
        var me = this;

        me.control({
            'slateadmin-navigation': {
                beforerender: me.onBeforeRenderNavigation
            }
        });
    },
    

    // event handlers
    onBeforeRenderNavigation: function(navCt) {
        var me = this;

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
                controller.navPanel = navPanel;
                navCt.add(navPanel);
            }
        });
    },
    
//    onLoadNavPath: function(navPath, rootPath, pathController) {
//        var path = navPath;
//        path.unshift(rootPath);
//
//        // activate any matching links
//        Ext.select('a.viewport-nav-active').removeCls('viewport-nav-active');
//        Ext.select('a[href=#'+path.join('/')+']').addCls('viewport-nav-active');
//
//        // expand menu
//        if(pathController.navPanel)
//            pathController.navPanel.expand();
//    },


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