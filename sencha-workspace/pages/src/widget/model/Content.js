/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.Content', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: [
        'modelwidget.Emergence\\CMS\\AbstractContent',
        'modelwidget.Emergence\\CMS\\Page',
        'modelwidget.Emergence\\CMS\\BlogPost'
    ],

    getCollectionTitle: function(models) {
        if (models && models.length) {
            return models[0].Class == 'Emergence\\CMS\\Page' ? 'Pages' : 'Blog Posts';
        } else {
            return 'Content';
        }
    },

    tpl: [
        '<tpl if="Class == \'Emergence\\\\CMS\\\\BlogPost\'">',
            '<a href="/blog/{Handle}" class="link-model link-content link-content-page">',
        '<tpl elseif="Class == \'Emergence\\\\CMS\\\\Page\'">',
            '<a href="/pages/{Handle}" class="link-model link-content link-content-blogpost">',
        '</tpl>',
            '{Title}',
        '</a>'
    ]
});