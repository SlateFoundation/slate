/*jslint browser: true, undef: true *//*global Ext*/
// @require-package emergence-cms
Ext.define('Site.page.ContentEditor', {
    singleton: true,
    requires: [
        'Site.Common',
        'Emergence.cms.view.DualView',
        'Ext.QuickTips'
    ],

    constructor: function() {
        Ext.onReady(this.onDocReady, this);
    },

    onDocReady: function() {
        var contentEditorCt = Ext.getBody().down('#contentEditorCt'),
            siteEnv = window.SiteEnvironment || {},
            editorConfig = {},
            dualView;

        // initialize QuickTips
        Ext.QuickTips.init();

        // empty content editor container
        contentEditorCt.empty();
        
        // pass env data to initial editor config
        if (siteEnv.cmsComposers) {
            editorConfig.composers = siteEnv.cmsComposers;
        }
        
        if (siteEnv.cmsContent) {
            editorConfig.contentRecord = siteEnv.cmsContent;
        }

        // render dual-view content editor
        dualView = Ext.create('Emergence.cms.view.DualView', {
            renderTo: contentEditorCt,
            editorConfig: editorConfig
        });

        // recalculate content editor layout on window resize
        Ext.on('resize', function() {
            dualView.doLayout();
        }, dualView, { buffer: 100 });
    }
});