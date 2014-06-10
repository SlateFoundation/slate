/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',
        
        // Jarvus enhancements
        'Jarvus.ext.override.grid.column.ActionEvents',
        'Jarvus.ext.override.grid.column.ActionGlyphs',

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
        
        'Groups',
        'Terms',
        'Courses'
        
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

    loadCard: function(card) {
        return this.getController('Viewport').loadCard(card);
    }
});