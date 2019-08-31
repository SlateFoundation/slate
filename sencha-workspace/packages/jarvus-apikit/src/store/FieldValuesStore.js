Ext.define('Jarvus.store.FieldValuesStore', {
    extend: 'Ext.data.Store',
    alias: 'store.fieldvalues',


    idProperty: 'text',
    fields: [
        'text'
    ],


    config: {
        valuesModel: null,
        valuesField: null
    },


    /**
     * Automatically inject "connection" class into requires
     */
    onClassExtended: function(cls, data, hooks) {
        var valuesModel = data.valuesModel || data.config && data.config.valuesModel,
            onBeforeClassCreated;

        if (typeof valuesModel === 'string') {
            onBeforeClassCreated = hooks.onBeforeCreated;

            hooks.onBeforeCreated = function() {
                var me = this,
                    args = arguments;

                Ext.require(valuesModel, function() {
                    onBeforeClassCreated.apply(me, args);
                });
            };
        }
    },

    constructor: function() {
        var me = this,
            Model, fieldName, field,
            values, valuesLength, valuesIndex = 0,
            data = [];

        me.callParent(arguments);


        Model = me.getValuesModel();
        fieldName = me.getValuesField();

        if (!Model || !fieldName) {
            Ext.Logger.warn(me.$className+': valuesModel and valuesField must be configured');
            return;
        }


        field = Model.getField(fieldName);

        if (!field) {
            Ext.Logger.warn(me.$className+': field "'+fieldName+'" not found in model "'+Model.$className+'"');
            return;
        }

        values = field.values || [];
        valuesLength = values.length;

        for (; valuesIndex < valuesLength; valuesIndex++) {
            data.push({
                text: values[valuesIndex]
            });
        }

        me.loadData(data);
    },

    /**
     * Convert "valuesModel" class into constructor reference
     */
    applyValuesModel: function(valuesModel) {
        if (typeof valuesModel == 'string') {
            Ext.syncRequire(valuesModel);
            valuesModel = Ext.ClassManager.get(valuesModel);
        }

        return valuesModel;
    }
});