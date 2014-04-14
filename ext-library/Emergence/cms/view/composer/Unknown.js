/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.view.composer.Unknown', {
    extend: 'Emergence.cms.view.composer.Abstract',
    xtype: 'emergence-cms-composer-unknown',

    height: 100,
    tpl: [
        '<p>Composer unavailable for content item type: {Class}</p>',
        '<p>The editor for this item is not available, it will not be modified when this post is saved.</p>'
    ],

    initComponent: function() {
        var me = this;

        me.update(this.contentItem);

        me.callParent();
    }
});