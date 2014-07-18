/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',
        
        // Jarvus enhancements
        'Jarvus.ext.override.grid.column.ActionEvents',
        'Jarvus.ext.override.grid.column.ActionGlyphs',
        'Jarvus.ext.override.panel.ToggleEvent',
        'Jarvus.ext.override.tree.Records',
        
        // Jarvus bug fixes
        'Jarvus.ext.patch.panel.ExpandBeforeRender',
        'Jarvus.ext.patch.grid.ResetTipAttributes',
        'Jarvus.ext.patch.data.BufferedStoreStrictId',
        'Jarvus.ext.patch.data.TreeStoreIndexOf',

        // framework features
        'Ext.state.LocalStorageProvider'
    ],


    // application config
    name: 'SlateAdmin',
    suspendLayoutUntilInitialRoute: true,

    controllers: [
        'Viewport',
        'Login',
        
        'People',
//        'people.Invite',
        'people.Profile',
        'people.Courses',
        'people.Contacts',

        'Terms',
        'Courses',
        'Settings',
        'settings.Groups'

        //<debug>
        ,'DeveloperTools'
        //</debug>
    ],


    // application template methods
    init: function() {
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider', {
            prefix: 'slateadmin-'
        }));
    },


    // application methods
    getModuleByRootPath: function(rootPath) {
        var matchedController;
        
        this.controllers.each(function(controller) {
            if (controller.rootPath == rootPath) {
                matchedController = controller;
                return false;
            }
        });
        
        return matchedController;
    },
    
    onRouteNotFound: function(token) {
        if (!token) {
            Ext.util.History.add('people');
        } else {
            console.warn('Route not found: %o', token);
        }
    }
});