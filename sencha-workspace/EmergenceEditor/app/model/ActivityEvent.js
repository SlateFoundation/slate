Ext.define('EmergenceEditor.model.ActivityEvent', {
    extend: 'Ext.data.Model',


    idProperty: 'href',

    fields: [
        {
            name: 'EventType',
            type: 'string'
        },
        {
            name: 'Handle',
            type: 'string'
        },
        {
            name: 'CollectionPath',
            type: 'string'
        },
        {
            name: 'FirstTimestamp',
            type: 'date',
            dateFormat: 'timestamp',
            allowNull: true
        },
        {
            name: 'Timestamp',
            type: 'date',
            dateFormat: 'timestamp'
        },
        {
            name: 'RevisionID',
            type: 'integer'
        },
        {
            name: 'FirstRevisionID',
            type: 'integer'
        },
        {
            name: 'FirstAncestorID',
            type: 'integer',
            allowNull: true
        },
        {
            name: 'revisions',
            allowNull: true
        },
        {
            name: 'files',
            allowNull: true
        },
        {
            name: 'revisionsCount',
            depends: ['revisions'],
            convert: function (v, r) {
                var revisions = r.get('revisions');

                return revisions ? revisions.length : null;
            },
            allowNull: true
        },
        {
            name: 'Author'
        },
        {
            name: 'Collection'
        }
    ]
});