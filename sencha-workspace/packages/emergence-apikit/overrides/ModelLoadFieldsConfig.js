Ext.define('Emergence.overrides.ModelLoadFieldsConfig', {
    override: 'Ext.data.Model',


    inheritableStatics: {
        loadFieldsConfig: function(fieldsConfig) {
            var fieldName, fieldConfig, field;

            if (!fieldsConfig) {
                return;
            }

            for (fieldName in fieldsConfig) {
                if (!fieldsConfig.hasOwnProperty(fieldName)) {
                    continue;
                }

                fieldConfig = fieldsConfig[fieldName];
                field = this.getField(fieldName);

                if (!field) {
                    continue;
                }

                if (fieldConfig.default) {
                    field.defaultValue = fieldConfig.default;
                }

                if (fieldConfig.values) {
                    field.values = fieldConfig.values;
                }
            }
        }
    }
});
