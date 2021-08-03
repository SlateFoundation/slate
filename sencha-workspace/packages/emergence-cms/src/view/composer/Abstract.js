/* jslint browser: true, undef: true *//* global Ext*/
Ext.define('Emergence.cms.view.composer.Abstract', {
    extend: 'Ext.dashboard.Panel',
    xtype: 'emergence-cms-composer',
    componentCls: 'emergence-cms-composer',

    config: {

        /**
         * @cfg Object containing data for initially loaded content item
         */
        contentItem: null
    },

    inheritableStatics: {
        contentCls: null
    },

    collapsible: false,
    frame: false,

    getContentItemId: function() {
        var me = this,
            contentItem = me.getContentItem();

        if (contentItem && contentItem.ID) {
            return contentItem.ID;
        }

        return me.phantomId || (me.phantomId = Ext.id(false, 'emergence-cms-phantom'));
    },

    getPreviewHtml: function(callback) {
        callback('');
    },

    getItemData: function() {
        var me = this,
            data = {},
            contentItem = me.getContentItem(),
            contentItemClass = me.self.contentItemClass;

        if (contentItem && contentItem.ID) {
            data.ID = contentItem.ID;
        }

        if (contentItemClass) {
            data.Class = Ext.isArray(contentItemClass) ? contentItemClass[0] : contentItemClass;
        }

        return data;
    },

    isEmpty: function () {
        return Ext.isEmpty(this.getItemData().Data);
    },

    firePreviewChange: function(html) {
        var me = this;

        me.getPreviewHtml(function(html) {
            me.fireEvent('previewchange', me, html);
        });
    }

//     initComponent: function() {
//         var me = this;
//
// //      if(!me.contentItem)
// //      {
// //          me.contentItem = {
// //              ID: Ext.id()
// //          };
// //          me.phantom = true;
// //      }
//
//         me.addEvents(
// //          /**
// //           * Fired when composer is rendered and has loaded initial content item
// //           */
// //          'ready',
//             /**
//              * Fired before a drag is started
//              */
//             'dragstart',
//             /**
//              * Fired after the composer is dropped in a new location
//              */
//             'dropped'
//         );
//
//         // call parent
//         me.callParent();
//     },
//
//     initDraggable: function() {
//         var me = this,
//             dd;
//
//         me.callParent(arguments);
//         dd = me.dd;
//
//         dd.startDrag = Ext.Function.createSequence(dd.startDrag, function() {
//             me.fireEvent('dragstart', me);
//         });
//     }
});
