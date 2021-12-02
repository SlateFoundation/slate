/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.grid.ContactPointCellEditor', {
    extend: 'Ext.grid.CellEditor',

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.field.on('select', 'onSerializedSelect', me);
    },

    startEdit: function() {
        var me = this,
            field = me.field;

        if (field.setSerializedData) {
            field.setSerializedData(me.editingPlugin.context.record.get('Data'));
        }

        me.callParent(arguments);

        // overwrite startValue with the value as its returned from the field immediately after setting it (in callParent)
        // this lets us compare the values after any transformations the field applies for editing
        me.startValue = field.getValue();
    },

    completeEdit: function(remainVisible) {
        var me = this,
            field = me.field,
            serializedValue = me.serializedValue,
            record = me.context.record;

        // more advanced editors might set a serialized value for saving instead of the string value
        if (me.editing && serializedValue) {
            delete me.serializedValue;

            if (record.get('Data') != serializedValue) {
                // silently revert any raw field change and apply serialized value change instead
                field.suspendEvents();
                me.setValue(me.startValue);
                field.resumeEvents();

                record.set({
                    Data: serializedValue,
                    String: null
                });
            }
        }

        this.callParent(arguments);
    },

    onSerializedSelect: function(field, serialized) {
        this.serializedValue = serialized;
        this.completeEdit(false);
    }
});