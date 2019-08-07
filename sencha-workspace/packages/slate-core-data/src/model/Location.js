Ext.define('Slate.model.Location', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Locations',
        'Ext.data.identifier.Negative'
    ],


    // model config
    idProperty: 'ID',
    identifier: 'negative',

    fields: [

        // ActiveRecord fields
        {
            name: 'ID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Class',
            type: 'string',
            defaultValue: 'Emergence\\Locations\\Location'
        },
        {
            name: 'Created',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'CreatorID',
            type: 'int',
            allowNull: true,
            persist: false
        },

        // VersionedRecord fields
        {
            name: 'Modified',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true,
            persist: false
        },
        {
            name: 'ModifierID',
            type: 'int',
            allowNull: true,
            persist: false
        },

        // Location fields
        {
            name: 'Title',
            type: 'string'
        },
        {
            name: 'Handle',
            type: 'string'
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'Live'
        },
        {
            name: 'Description',
            type: 'string',
            allowNull: true
        },
        {
            name: 'ParentID',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Left',
            type: 'int',
            allowNull: true
        },
        {
            name: 'Right',
            type: 'int',
            allowNull: true
        },

        // virtual fileds
        {
            name: 'leaf',
            type: 'boolean',
            persist: false,
            depends: ['Left', 'Right'],
            convert: function(v, r) {
                if (typeof v == 'boolean') {
                    return v;
                } else {
                    return r.get('Left') + 1 == r.get('Right');
                }
            }
        }
    ],

    proxy: 'slate-locations',

    validators: [
        {
            field: 'Title',
            type: 'presence',
            message: 'Title is required'
        }
    ]
});