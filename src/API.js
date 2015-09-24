/*jslint browser: true ,undef: true *//*global Ext*/
Ext.define('Slate.API', {
    extend: 'Emergence.util.AbstractAPI',
    singleton: true,

    // example function
    getMySections: function(callback, scope) {
        this.request({
            url: '/sections',
            method: 'GET',
            params: {
                AllCourses: 'false'
            },
            success: callback,
            scope: scope
        });
    }
}, function(API) {
    var pageParams = Ext.Object.fromQueryString(location.search);

    // allow API host to be overridden via apiHost param
    if (pageParams.apiHost) {
        API.setHost(pageParams.apiHost);
        API.setUseSSL(!!pageParams.apiSSL);
    }
});