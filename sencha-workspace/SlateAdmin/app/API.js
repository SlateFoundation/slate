/*jslint browser: true ,undef: true *//*global Ext*/
Ext.define('SlateAdmin.API', {
    extend: 'Emergence.util.AbstractAPI',
    singleton: true,


    // example function
    getMySections: function(callback, scope) {
        this.request({
            url: '/sections/json',
            method: 'GET',
            params: {
                AllCourses: 'false'
            },
            success: callback,
            scope: scope
        });
    },

    downloadFile: function(url, callback, scope, options) {
        options = options || {};

        var apiHost = this.getHost(),
            downloadToken = Math.random(),
            pollingInterval = options.pollingInterval || 100,
            callbackArgs = [url, options],
            downloadInterval;

        if (!apiHost) {
            url = Ext.urlAppend(url, 'downloadToken=' + downloadToken);
        }
        url = this.buildUrl(url);

        // get or create iframe el
        this.downloadFrame = this.downloadFrame || Ext.getBody().createChild({
            tag: 'iframe',
            style: {
                display: 'none'
            }
        });

        if (apiHost) {
            // skip token if using remote api host, cookie won't be readable
            Ext.defer(callback, pollingInterval, scope, callbackArgs);
        } else {
            // setup token monitor
            downloadInterval = setInterval(function() {
                if (Ext.util.Cookies.get('downloadToken') == downloadToken) {
                    clearInterval(downloadInterval);
                    Ext.util.Cookies.clear('downloadToken');
                    Ext.callback(callback, scope, callbackArgs);
                }
            }, pollingInterval);
        }

        // launch download
        if (options.openWindow) {
            window.open(url);
        } else {
            // use iframe for loading, setting window.location cancels current network ops
            this.downloadFrame.dom.src = url;
        }
    }
}, function(API) {
    var pageParams = Ext.Object.fromQueryString(location.search);

    // allow API host to be overridden via apiHost param
    if (pageParams.apiHost) {
        API.setHostname(pageParams.apiHost);
        API.setUseSSL(!!pageParams.apiSSL);
    }
});