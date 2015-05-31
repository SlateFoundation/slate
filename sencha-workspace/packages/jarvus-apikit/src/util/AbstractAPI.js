/*jslint browser: true, undef: true*//*global Ext*/

/**
 * @abstract
 * An abstract class for singletons that facilitates communication with backend services
 * 
 * TODO:
 * - add events for all lifecycle events: beforerequest, request, beforexception, exception, unauthorized
 */
Ext.define('Jarvus.util.AbstractAPI', {
    extend: 'Ext.data.Connection',
    uses: [
        'Jarvus.util.APIDomain'
    ],

    config: {
        /**
         * @cfg {String/null}
         * A hostname to prefix URLs with, or null to leave paths domain-relative
         */
        hostname: null,
        
        /**
         * @cfg {Boolean}
         * True to use HTTPS when prefixing hostname. Only used if {@link #cfg-hostname} is set
         */
        useSSL: false,

        // @inheritdoc
        withCredentials: true
    },

    //@private
    buildUrl: function(path) {
        var hostname = this.getHostname();
        return hostname ? (this.getUseSSL() ? 'https://' : 'http://')+hostname+path : path;
    },

    //@private
    buildHeaders: function(headers) {
        return headers;
    },

    //@private
    buildParams: function(params) {
        return params || null;
    },

    /**
     * Override {@link Ext.data.Connection#method-request} to implement auto-decoding and retry handler
     * @inheritdoc
     */
    request: function(options) {
        var me = this;

        return Ext.Ajax.request(Ext.applyIf({
            url: me.buildUrl(options.url),
            withCredentials: true,
            params: me.buildParams(options.params),
            headers: me.buildHeaders(options.headers),
            timeout: options.timeout || 30000,
            success: function(response) {

                if (options.autoDecode !== false && response.getResponseHeader('Content-Type') == 'application/json') {
                    response.data = Ext.decode(response.responseText, true);
                }

                //Calling the callback function sending the decoded data
                Ext.callback(options.success, options.scope, [response]);

            },
            failure: function(response) {

                if (options.autoDecode !== false && response.getResponseHeader('Content-Type') == 'application/json') {
                    response.data = Ext.decode(response.responseText, true);
                }

                if (options.failure && options.failureStatusCodes && Ext.Array.contains(options.failureStatusCodes, response.status)) {
                    Ext.callback(options.failure, options.scope, [response]);
                } else if (options.exception) {
                    Ext.callback(options.exception, options.scope, [response]);
                } else if (response.aborted === true) {
                    Ext.callback(options.abort, options.scope, [response]);
                } else {
                    Ext.Msg.confirm('An error occurred' ,'There was an error trying to reach the server. Do you want to try again?', function(btn) {
                        if (btn === 'yes') {
                            me.request(options);
                        }
                    });
                }

            },
            scope: options.scope
        }, options));
    }
});