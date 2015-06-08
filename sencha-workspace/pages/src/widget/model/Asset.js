/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.Asset', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: 'modelwidget.Slate\\Assets\\Asset',

    collectionTitleTpl: 'Asset',

    tpl: [
        '<a href="/assets/{ID}" class="link-model link-asset">',
            '<strong class="result-title">{Name}</strong> ',
            '<span class="result-info">ID: {ID}</span>',
        '</a>'
    ]
});