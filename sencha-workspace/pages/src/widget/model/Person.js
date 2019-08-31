/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.Person', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: [
        'modelwidget.Emergence\\People\\Person',
        'modelwidget.Emergence\\People\\User',
        'modelwidget.Person',
        'modelwidget.User'
    ],

    collectionTitleTpl: 'People',

    tpl: [
        '<a href="/people/{Username:defaultValue(values.ID)}" class="link-model link-person">',
            '<tpl if="PrimaryPhotoID">',
                '<div class="result-image" style="background-image:url(/thumbnail/{PrimaryPhotoID}/72x72/cropped)"></div>',
            '</tpl>',
            '<strong class="result-title">{FirstName} {LastName}</strong> ',
            '<tpl if="Username"><span class="result-info">{Username}</strong></tpl>',
        '</a>'
    ]
});