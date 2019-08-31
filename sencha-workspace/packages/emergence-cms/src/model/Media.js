Ext.define('Emergence.cms.model.Media', {
    extend: 'Ext.data.Model',
    requires: [
        'Emergence.proxy.Records'
    ],


    // model config
    idProperty: 'ID',

    fields: [
        {
            name: 'ID',
            type: 'int',
            useNull: true
        },
        {
            name: 'Class',
            type: 'string',
            defaultValue: 'Media'
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
            name: 'ContextClass',
            type: 'string',
            useNull: true
        },
        {
            name: 'ContextID',
            type: 'int',
            useNull: true
        },
        {
            name: 'MIMEType',
            type: 'string'
        },
        {
            name: 'Width',
            type: 'int',
            useNull: true
        },
        {
            name: 'Height',
            type: 'int',
            useNull: true
        },
        {
            name: 'Duration',
            type: 'float',
            useNull: true
        },
        {
            name: 'Caption',
            type: 'string',
            useNull: true
        }
    ],

    proxy: {
        type: 'records',
        url: '/media'
    }
});