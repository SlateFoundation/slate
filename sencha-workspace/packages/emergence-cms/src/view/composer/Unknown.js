/* jslint browser: true, undef: true *//* global Ext*/
Ext.define('Emergence.cms.view.composer.Unknown', {
    extend: 'Emergence.cms.view.composer.Abstract',
    alias: 'emergence-cms-composer.unknown',
    cls: 'unknown-composer',

    title: 'Unknown item type',
    resizable: false,
    tpl: [
        '<p>Composer unavailable for content item type: {Class:htmlEncode}</p>',
        '<p>No editor for this item is currently available, it will be preserved unmodified when this post is saved.</p>'
    ],

    initComponent: function() {
        var me = this;

        me.update(me.contentItem);

        me.callParent();
    },

    isEmpty: function() {
        return false; // we cannot know for sure
    }
});
