Ext.define('Slate.model.Term', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Terms',
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
            defaultValue: 'Slate\\Term'
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

        // Term fields
        {
            name: 'Title',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Handle',
            type: 'string',
            allowNull: true
        },
        {
            name: 'Status',
            type: 'string',
            defaultValue: 'Live'
        },
        {
            name: 'StartDate',
            type: 'date',
            dateFormat: 'Y-m-d',
            allowNull: true
        },
        {
            name: 'EndDate',
            type: 'date',
            dateFormat: 'Y-m-d',
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

        // virtual fields
        // TOOD: test if still needed
        {
            name: 'titlesPath',
            type: 'string',
            persist: false
        },
        {
            name: 'leaf',
            type: 'boolean',
            persist: false,
            depends: ['Left', 'Right'],
            convert: function(v, r) {
                if (typeof v == 'boolean') {
                    return v;
                } else {
                    return r.get('Left') == r.get('Right') - 1;
                }
            }
        },
        {
            name: 'masterStartDate',
            type: 'date',
            persist: false,
            allowNull: true
        }
    ],

    proxy: 'slate-terms',

    validators: [
        {
            field: 'Title',
            type: 'presence',
            message: 'Title is required'
        },
        {
            field: 'StartDate',
            type: 'presence',
            message: 'Start date is required'
        },
        {
            field: 'EndDate',
            type: 'presence',
            message: 'End date is required'
        }
    ]
});