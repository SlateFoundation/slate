Ext.define('Emergence.cms.model.Content', {
    extend: 'Ext.data.Model',
    requires: [
        'Emergence.proxy.Records',
        'Ext.data.identifier.Negative'
    ],

    statics: {
        classRoutes: {
            'Emergence\\CMS\\BlogPost': '/blog',
            'Emergence\\CMS\\Page': '/pages',
            'Emergence\\CMS\\Feature': '/features'
        }
    },

    identifier: 'negative',
    idProperty: 'ID',
    fields: [
        { name: 'ID',
            type: 'int' },
        { name: 'Class' },
        { name: 'ContextClass',
            type: 'string',
            useNull: true },
        { name: 'ContextID',
            type: 'int',
            useNull: true },
        { name: 'Handle',
            type: 'string' },
        { name: 'Created',
            type: 'date',
            dateFormat: 'timestamp' },
        { name: 'Published',
            type: 'date',
            dateFormat: 'timestamp' },
        { name: 'AuthorID',
            type: 'int' },
        { name: 'CreatorID',
            type: 'int' },
        { name: 'Title',
            type: 'string' },
        { name: 'Status',
            type: 'string' },
        { name: 'Visibility',
            type: 'string' },
        { name: 'tags' },
        { name: 'items' }
    ],

    proxy: {
        type: 'records',
        include: ['items', 'tags']
    },

    // implement class-dependent load/save URLs
    getClassRoute: function() {
        return this.self.classRoutes[this.get('Class')] || null;
    },

    toUrl: function() {
        var me = this,
            classRoute = me.getClassRoute();

        if (!classRoute) {
            // <debug>
            Ext.Logger.error('Unable to determine route for model with class '+me.get('Class'));
            // </debug>
            return null;
        }

        return classRoute + '/' + me.get('Handle');
    },

    load: function(options) {
        var me = this;

        if (!options.url) {
            options.url = me.toUrl();
        }

        return me.callParent([options]);
    },

    save: function(options) {
        var me = this;

        options.url = me.getClassRoute() + '/save';
        return me.callParent([options]);
    }
});