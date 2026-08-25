/**
 * @abstract
 * Shared workflow for panels living in a manager's details tabpanel:
 * a loadedX config's update handler dispatches to a template hook and
 * fires a semantic event, so each concrete panel loads the record
 * just-in-time and controllers react declaratively.
 *
 * Subclasses (the per-module AbstractDetails classes) declare the
 * module's loadedX config and call syncLoadedRecord from its update
 * handler, with the hook/event names set via the contract properties.
 */
Ext.define('SlateAdmin.view.AbstractRecordDetails', {
    extend: 'Ext.panel.Panel',


    // subclass contract
    recordLoadedHook: null, // e.g. 'onPersonLoaded' — @template on concrete panels
    recordLoadedEvent: null, // e.g. 'personloaded'


    // component methods
    // @private
    syncLoadedRecord: function(record, oldRecord) {
        var me = this;

        me[me.recordLoadedHook](record, oldRecord);
        me.fireEvent(me.recordLoadedEvent, me, record, oldRecord);
    }
});
