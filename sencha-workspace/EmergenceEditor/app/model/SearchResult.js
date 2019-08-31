Ext.define('EmergenceEditor.model.SearchResult', {
    extend: 'Ext.data.Model',


    fields: [
        {
            name: 'ID',
            type: 'integer'
        },
        {
            name: 'CollectionID',
            type: 'integer'
        },
        {
            name: 'SHA1',
            type: 'string'
        },
        {
            name: 'Site',
            type: 'string'
        },
        {
            name: 'Path',
            type: 'string'
        },
        {
            name: 'ContentMatch',
            allowNull: true
        },

        // virtual fields
        {
            name: 'Local',
            depends: ['Site'],
            convert: function(v, r) {
                return r.get('Site') == 'Local'
            }
        },
        {
            name: 'Remote',
            depends: ['Site'],
            convert: function(v, r) {
                return r.get('Site') == 'Remote'
            }
        },
        {
            name: 'Handle',
            depends: ['Path'],
            convert: function(v, r) {
                var path = r.get('Path');

                return path.substr(path.lastIndexOf('/') + 1);
            }
        },
        {
            name: 'FullPath',
            depends: ['Remote', 'Path'],
            convert: function(v, r) {
                var path = r.get('Path');

                if (r.get('Remote')) {
                    path = '_parent/' + path;
                }

                return path;
            }
        },
        {
            name: 'FullDirname',
            depends: ['FullPath'],
            convert: function(v, r) {
                var path = r.get('FullPath');

                return path.substr(0, path.lastIndexOf('/'));
            }
        },
        {
            name: 'LineNumber',
            type: 'integer',
            mapping: 'ContentMatch.line'
        }
    ]
});