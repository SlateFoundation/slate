/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.grid.ContactPointCellEditor', {
    extend: 'Ext.grid.CellEditor',

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.field.on('select', 'onSerializedSelect', me);
    },

    startEdit: function(el, value, context) {
        var me = this,
            field = me.field;

        if (field.setSerializedData) {
            field.setSerializedData(context.record.get('Data'));
        }

        me.activeContext = context;

        me.callParent(arguments);

        // overwrite startValue with the value as its returned from the field immediately after setting it (in callParent)
        // this lets us compare the values after any transformations the field applies for editing
        me.startValue = field.getValue();
    },

    completeEdit : function(remainVisible) {
        var me = this,
            field = me.field,
            serializedValue = me.serializedValue,
            context = me.activeContext,
            record = context.record;

        if (!me.editing) {
            return;
        }

        if (serializedValue) {
            record.set('Data', serializedValue);
            delete me.serializedValue;

            if (record.dirty) {
                field.disable();
                record.set('String', null);
                record.save({
                    callback: function() {
                        me.hideEdit(remainVisible);
                        me.fireEvent('complete', me, record.get('String'), me.startValue);
                        field.enable();
                    }
                });
                return;
            }
        }

        this.callParent(arguments);
    },

    onSerializedSelect: function(field, serialized) {
        this.serializedValue = serialized;
        this.completeEdit(false);
    }
});