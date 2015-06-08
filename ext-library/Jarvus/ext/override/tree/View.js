Ext.define('Jarvus.ext.override.tree.View', {
    override: 'Ext.tree.View',

    processUIEvent: function(e) {

        // If the target event has been removed from the body (data update causing view DOM to be updated),
        // do not process. isAncestor uses native methods to check.
        if (!Ext.getBody().isAncestor(e.target)) {
            return;
        }

        var me = this,
            item = e.getTarget(me.dataRowSelector || me.itemSelector, me.getTargetEl()),
            map = me.statics().EventMap,
            index, record,
            type = e.type,
            newType = e.type,
            sm;

        // If the event is a mouseover/mouseout event converted to a mouseenter/mouseleave,
        // use that event type and ensure that the item is correct.
        if (e.newType) {
            newType = e.newType;
            item = e.item;
        }

        // For keydown events, try to get either the last focused item or the selected item.
        // If we have not focused an item, we'll just fire a container keydown event.
        if (!item && type == 'keydown') {
            sm = me.getSelectionModel();
            record = sm.lastFocused || sm.getLastSelected();
            if (record) {
                item = me.getNode(record, true);
            }
        }

        if (item) {
            if (!record) {
                record = me.getRecord(item);
            }
            index = record ? me.indexInStore(record) : me.indexInStore(item);

            // It is possible for an event to arrive for which there is no record... this
            // can happen with dblclick where the clicks are on removal actions (think a
            // grid w/"delete row" action column) or if the record was in a page that was
            // pruned by a buffered store.
            if (!record || me.processItemEvent(record, item, index, e) === false) {
                return false;
            }

            if (
                (me['onBeforeItem' + map[newType]](record, item, index, e) === false) ||
                (me.fireEvent('beforeitem' + newType, me, record, item, index, e) === false) ||
                (me['onItem' + map[newType]](record, item, index, e) === false)
            ) {
                return false;
            }

            me.fireEvent('item' + newType, me, record, item, index, e);
        }
        else {
            if (
                (me.processContainerEvent(e) === false) ||
                (me['onBeforeContainer' + map[type]](e) === false) ||
                (me.fireEvent('beforecontainer' + type, me, e) === false) ||
                (me['onContainer' + map[type]](e) === false)
            ) {
                return false;
            }

            me.fireEvent('container' + type, me, e);
        }

        return true;
    }
});