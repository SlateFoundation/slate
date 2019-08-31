Ext.define('Emergence.model.RecordClass', {
    extend: 'Ext.data.Model',


    idProperty: 'name',
    fields: [
        {
            name: 'name',
            type: 'string'
        },
        {
            name: 'label',
            type: 'string',
            convert: function(v, r) {
                return v || r.get('name').split('\\').pop();
            }
        },
        {
            name: 'interfaces',
            defaultValue: []
        },
        {
            name: 'default',
            type: 'boolean',
            defaultValue: false
        }
    ]
});
