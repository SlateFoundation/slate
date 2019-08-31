/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('EmergenceContentEditor.Application', {
    extend: 'Ext.app.Application',
    requires: [
        'Ext.container.Viewport',

        /* global Emergence */
        'Emergence.util.API',
        'Emergence.cms.view.DualView'
    ],

    name: 'EmergenceContentEditor',

    quickTips: false,
    platformConfig: {
        desktop: {
            quickTips: true
        }
    },

    launch: function () {
        var siteEnv = window.SiteEnvironment || {},
            viewportEl = Ext.get('app-viewport'),
            editorConfig = {},
            mainView;

        // configure editor
        if (siteEnv.cmsComposers) {
            editorConfig.composers = siteEnv.cmsComposers;
        }

        if (siteEnv.cmsContent) {
            editorConfig.contentRecord = siteEnv.cmsContent;
        }

        // instantiate editor
        mainView = Ext.create('Emergence.cms.view.DualView', {
            editorConfig: editorConfig
        });

        // load DualView UI into viewport element or created viewport container
        if (viewportEl) {
            viewportEl.empty();
            mainView.render(viewportEl);

            viewportEl.on('resize', function(el, info) {
                mainView.setWidth(info.contentWidth);
            });
        } else {
            Ext.create('Ext.container.Viewport', {
                layout: 'fit',
                items: mainView
            });
        }

        this.callParent();
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
