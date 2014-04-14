/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.model.Event', {
    extend: 'Site.widget.model.AbstractModel',
    singleton: true,
    alias: [
        'modelwidget.Emergence\\Events\\Event',
        'modelwidget.Emergence\\Events\\FeedEvent'
    ],

    collectionTitleTpl: 'Events',

    tpl: [
        '<a href="/events/{Handle}" class="link-model link-event">',
            '<strong class="result-title">{Title}</strong> ',
            '<span class="result-info">{StartTime:date("l, M j, Y @ g:i a")}</span>',
        '</a>'
    ],

    getTemplateData: function(model) {
        return Ext.applyIf({
            StartTime: model.StartTime && new Date(model.StartTime * 1000)
        }, model);
    }
});
