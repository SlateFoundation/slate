/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Emergence.cms.model.Content', {
    extend: 'Ext.data.Model',
    requires:[
        'Emergence.ext.proxy.Records'
    ],

    statics: {
        classRoutes: {
            'Emergence\\CMS\\BlogPost': '/blog',
            'Emergence\\CMS\\Page': '/pages',
            'Emergence\\CMS\\Feature': '/features'
        }
    },

    idProperty: 'ID',
    fields: [
        {name: 'ID', type: 'int'},
        {name: 'Class'},
        {name: 'ContextClass', type: 'string', useNull: true},
        {name: 'ContextID', type: 'int', useNull: true},
        {name: 'Handle', type: 'string'},
        {name: 'Created', type: 'date', dateFormat: 'timestamp'},
        {name: 'Published', type: 'date', dateFormat: 'timestamp'},
        {name: 'AuthorID', type: 'int'},
        {name: 'CreatorID', type: 'int'},
        {name: 'Title', type: 'sting'},
        {name: 'Status', type: 'string'},
        {name: 'Visibility', type: 'string'},
        {name: 'tags'},
        {name: 'items'}
    ],
    proxy: {
        type: 'records',
        idParam: 'Handle',
        include: ['items', 'tags'],
        getUrl: function(request) {
            return (request.records && request.records.length && request.records[0].getClassRoute()) || this.url;
        }
    },

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
    }
});