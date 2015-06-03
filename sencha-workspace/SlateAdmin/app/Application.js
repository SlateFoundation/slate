/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',

        // Jarvus enhancements
        'Jarvus.ext.override.data.RequireLoadedStores',

        // Jarvus bug fixes
//        'Jarvus.ext.patch.panel.ExpandBeforeRender',
//        'Jarvus.ext.patch.grid.ResetTipAttributes',
//        'Jarvus.ext.patch.data.BufferedStoreStrictId',
//        'Jarvus.ext.patch.data.TreeStoreIndexOf',
//        'Jarvus.ext.patch.grid.DisableGroupingFeature', // not used

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

        'Courses',
        'courses.Profile',
        'courses.Participants',

        'Settings',
        'settings.Groups',

        'Terms',
        'Locations'

        //<debug>
        ,'DeveloperTools'
        //</debug>
    ],


    // application template methods
    init: function() {
        var pageParams = Ext.Object.fromQueryString(location.search);

        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider', {
            prefix: 'slateadmin-'
        }));

        if (pageParams.apiHost) {
            SlateAdmin.API.setHostname(pageParams.apiHost);
        }
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
