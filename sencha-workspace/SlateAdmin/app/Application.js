/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',
        
        // Jarvus enhancements
        'Jarvus.ext.override.grid.column.ActionEvents', // TODO: replace with jarvus-ext-actionevents package
        'Jarvus.ext.override.grid.column.ActionGlyphs', // TODO: replace with jarvus-ext-glyphs package
        'Jarvus.ext.override.panel.ToggleEvent',
        'Jarvus.ext.override.tree.Records',
        'Jarvus.ext.override.data.RequireLoadedStores',
        
        
        // Jarvus bug fixes
        'Jarvus.ext.patch.panel.ExpandBeforeRender',
        'Jarvus.ext.patch.grid.ResetTipAttributes',
        'Jarvus.ext.patch.data.BufferedStoreStrictId',
        'Jarvus.ext.patch.data.TreeStoreIndexOf',
//         'Jarvus.ext.patch.form.field.DirtyDisplayField',
//        'Jarvus.ext.patch.grid.DisableGroupingFeature', // not used

        // framework features
        'Ext.state.LocalStorageProvider',
        'Jarvus.util.CookieSniffer'
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
        'people.Progress',

        'Courses',
        'courses.Profile',
        'courses.Participants',

        'Settings',
        'settings.Groups',
        'settings.Terms',
        'settings.Locations',
        'settings.assets.Statuses',
        'settings.courses.Departments',
        'settings.courses.Courses',

        'Terms',
        'Locations',

        'Progress',
        'progress.Standards',
        'progress.Worksheets',
        'progress.Narratives',
        'progress.Interims',
        //<debug>
        'DeveloperTools'
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
    },
    
    //shortcut methods
    //TODO: remove after progress notes are ported.
    loadCard: function(card) {
        return this.getController('Viewport').loadCard(card);
    }
    
});