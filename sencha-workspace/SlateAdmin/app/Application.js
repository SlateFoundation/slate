/*jslint browser: true, undef: true, laxcomma:true *//*global Ext*/
/**
 * The Main Application definition
 */
Ext.define('SlateAdmin.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'SlateAdmin.API',

        // Jarvus enhancements
        'Jarvus.override.data.RequireLoadedStores',

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
        'people.Invite',
        'people.Profile',
        'people.Courses',
        'people.Contacts',
        'people.Progress',

        'Courses',
        'courses.Profile',
        'courses.Participants',

        'Settings',
        'settings.Groups',
        'settings.Courses',
        'settings.Departments',
        'settings.Terms',
        'settings.Locations',
        'settings.GlobalRecipients',

        'Terms',
        'Locations',

        'Progress',
        'progress.interims.Report',
        'progress.interims.Email',
        'progress.interims.Print',

        'progress.terms.Report',
        'progress.terms.Email',
        'progress.terms.Print'

        //<debug>
        ,'DeveloperTools'
        //</debug>
    ],


    listen: {
        controller: {
            '#': {
                unmatchedroute: 'onUnmatchedRoute'
            }
        }
    },

    /**
     * A template method that is called when the application boots. It is called before the Application's launch
     * function is executed so gives a hook point to run any code before your Viewport is created.
     *
     * Here we set up the Ext.state.Manager with an Ext.state.LocalStorageProvider and check the url for an apiHost
     * parameter and set the API hostname if it exists.
     * @return {void}
     */
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

    onUnmatchedRoute: function(token) {
        //<debug>
        Ext.log.warn('Route not found: ', token);
        //</debug>
    }
});
