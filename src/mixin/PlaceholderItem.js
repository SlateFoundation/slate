Ext.define('Slate.ui.mixin.PlaceholderItem', {
    extend: 'Ext.Mixin',
    requires: [
        'Slate.ui.Placeholder'
    ],


    mixinConfig: {
        after: {
            initItems: 'initPlaceholderItem'
        }
    },


    config: {

        /**
         * @cfg {Slate.ui.Placeholder|Object|string|boolean}
         * Instance or configuration for placeholder component.
         *
         * Setting boolean values change visibility.
         */
        placeholderItem: null,
    },


    // config handlers
    applyPlaceholderItem: function(placeholderItem, oldPlaceholderItem) {
        var type = typeof placeholderItem;

        if (type == 'boolean') {
            placeholderItem = {
                hidden: !placeholderItem
            };
        } else if (type == 'string') {
            placeholderItem = {
                html: placeholderItem,
                hidden: false
            };
        }

        return Ext.factory(placeholderItem, 'Slate.ui.Placeholder', oldPlaceholderItem && !oldPlaceholderItem.destroyed ? oldPlaceholderItem : null);
    },

    updatePlaceholderItem: function(placeholderItem, oldPlaceholderItem) {
        var me = this,
            items = me.items;

        if (items && items.isMixedCollection) {
            if (oldPlaceholderItem) {
                me.remove(oldPlaceholderItem);
            }

            if (placeholderItem) {
                me[placeholderItem.dock ? 'insertDocked' : 'insert'](0, placeholderItem);
            }
        }
    },


    // container lifecycle
    initPlaceholderItem: function() {
        var me = this,
            placeholderItem = me.getPlaceholderItem();

        if (placeholderItem) {
            me[placeholderItem.dock ? 'insertDocked' : 'insert'](0, placeholderItem);
        }
    }
});