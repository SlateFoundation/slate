/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.Tag', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: [
        'modelwidget.Tag'
    ],

    collectionTitleTpl: 'Tags',

    tpl: [
        '<a href="/tags/{Handle}" class="link-model link-tag">',
            '<strong class="result-title">{Title:htmlEncode}</strong>',
        '</a>'
    ]
});