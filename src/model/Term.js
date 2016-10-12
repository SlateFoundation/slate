Ext.define('Slate.model.Term', {
    extend: 'Ext.data.Model',
    requires: [
        'Slate.proxy.Records',
        'Ext.data.identifier.Negative'
    ],


    // model config
    idProperty: 'ID',
    identifier: 'negative',

    fields: [
        {
            name: 'ID',
            type: 'int',
            useNull: true
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
            useNull: true
        },
        {
            name: 'CreatorID',
            type: 'int',
            useNull: true
        },
        {
            name: 'Title',
            type: 'string',
            useNull: true
        },
        {
            name: 'Handle',
            type: 'string',
            useNull: true
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
            useNull: true
        },
        {
            name: 'EndDate',
            type: 'date',
            dateFormat: 'Y-m-d',
            useNull: true
        },
        {
            name: 'ParentID',
            type: 'int',
            useNull: true
        },
        {
            name: 'Left',
            type: 'int',
            useNull: true
        },
        {
            name: 'Right',
            type: 'int',
            useNull: true
        }
    ],

    proxy: {
        type: 'slate-records',
        url: '/terms'
    }
});