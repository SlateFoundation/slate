/*jslint browser: true, undef: true, laxcomma:true *//*global Ext*/
/**
 * The Main Application definition
 */
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',

        // Jarvus enhancements
        'Jarvus.ext.override.data.RequireLoadedStores',

        // framework features
        'Ext.state.LocalStorageProvider'
    ],


    /**
     * @cfg {String} name="SlateAdmin"
     */
    name: 'SlateAdmin',
    //suspendLayoutUntilInitialRoute: true, // TODO: find a way to achive this optimization with the built-in routing of ExtJS 5

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
        'settings.Courses',
        'settings.Departments',
        'settings.Terms',

        'Terms',
        'Locations'

        //<debug>
        ,'DeveloperTools'
        //</debug>
    ],


    /**
     * A template method that is called when the application boots. It is called before the Application's launch
     * function is executed so gives a hook point to run any code before your Viewport is created.
     *
     * Here we set up the Ext.state.Manager with an Ext.state.LocalStorageProvider and check the url for an apiHost
     * parameter and set the API hostname if it exists.
     * @return {void}
     */
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
