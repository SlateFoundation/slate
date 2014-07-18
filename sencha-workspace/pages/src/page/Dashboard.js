/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.page.Dashboard', {
    singleton: true,
    requires: [
        'Site.Common'
    ],

    constructor: function() {
        Ext.onReady(this.onDocReady, this);
    },

    onDocReady: function() {
        Ext.getBody().on('click', function(ev, t) {
            var dismissible = ev.getTarget('.dismissible', null, true),
                dismissibleId = dismissible.getAttribute('data-dismissible-id'),
                cookieExpires = new Date();

            dismissible.remove();

            if (dismissibleId) {
                cookieExpires.setFullYear(cookieExpires.getFullYear() + 10);
                document.cookie = dismissibleId+'_dismissed=1; path=/; expires='+cookieExpires.toGMTString();
            }
        }, null, { delegate: '.dismissible .dismiss-button' });
    }
});

