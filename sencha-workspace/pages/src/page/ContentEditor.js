/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.page.ContentEditor', {
    singleton: true,
    requires: [
        'Site.Common',
        'Emergence.cms.view.EditorPanel'
    ],

    constructor: function() {
        Ext.onReady(this.onDocReady, this);
    },

    onDocReady: function() {
        Ext.create('Emergence.cms.view.EditorPanel', {
            renderTo: Ext.getBody().down('#contentEditorCt')
        }).setContentRecord(window.ContentData);
    }
});