/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('EmergenceEditor.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'Ext.state.LocalStorageProvider',
        'Ext.plugin.Viewport'
    ],


    name: 'EmergenceEditor',

    defaultToken: 'activity',

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true
        }
    },

    controllers: [
        'Tabs',
        'Filesystem',
        'Editors',
        'Revisions',
        'Activity',
        'Diff',
        'Search'
    ],

    views: [
        'viewport.IDE',
        'viewport.FullEditor'
    ],


    launch: function() {
        var me = this,
            launchParams = me.launchParams = Ext.Object.fromQueryString(location.search);

        // disable ARIA warnings
        Ext.ariaWarn = Ext.emptyFn;

        // initialize state manager
        Ext.state.Manager.setProvider(Ext.create('Ext.state.LocalStorageProvider'));

        // initialize viewport
        me.setMainView(launchParams.fullscreen ? 'viewport.FullEditor' : 'viewport.IDE');

        // remove loading class
        Ext.getBody().removeCls('loading');

        // get ref to title tag
        me.titleDom = document.querySelector('title');
    },


    // todo: make this ask the tab for the title and moving this to ontabchange
    setActiveView: function(token, title) {
        Ext.util.History.add(token, true);
        this.titleDom.innerHTML = title + ' @ ' + location.hostname;
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
