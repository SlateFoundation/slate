Ext.define('EmergenceEditor.model.Revision', {
    extend: 'Ext.data.Model',


    idProperty: 'ID',

    fields: [
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'Class',
            type: 'string'
        },
        {
            name: 'Handle',
            type: 'string'
        },
        {
            name: 'Type',
            type: 'string'
        },
        {
            name: 'MIMEType',
            type: 'string'
        },
        {
            name: 'Size',
            type: 'integer'
        },
        {
            name: 'SHA1',
            type: 'string'
        },
        {
            name: 'Status',
            type: 'string'
        },
        {
            name: 'Timestamp',
            type: 'date',
            dateFormat: 'timestamp'
        },
        {
            name: 'AuthorID',
            type: 'integer'
        },
        {
            name: 'Author'
        },
        {
            name: 'AuthorUsername',
            mapping: 'Author.Username'
        },
        {
            name: 'AncestorID',
            type: 'integer'
        },
        {
            name: 'CollectionID',
            type: 'integer'
        },
        {
            name: 'FullPath',
            type: 'string'
        }
    ],

    toUrl: function() {
        return '/' + this.get('FullPath') + '@' + this.getId();
    }
});