Ext.define('Slate.ui.override.AddSorted', {
    override: 'Ext.container.Container',


    addSorted: function(items) {
        var me = this,
            rendered = me.rendered,
            itemsCollections = me.items,
            preparedItems = me.prepareItems(items, true),
            itemsLength = preparedItems.length,
            itemIndex = 0, item;

        if (rendered) {
            Ext.suspendLayouts();
        }

        for (; itemIndex < itemsLength; itemIndex++) {
            item = preparedItems[itemIndex];
            me.insert(itemsCollections.findInsertionIndex(item) || 0, item);
        }

        if (rendered) {
            Ext.resumeLayouts(true);
        }

        return Ext.isArray(items) ? preparedItems : preparedItems[0];
    }
});