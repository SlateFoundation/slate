/*jslint browser: true, undef: true*//*global Ext*/

/**
 * @abstract
 * An abstract class for singletons that facilitates communication with backend services
 */
Ext.define('Jarvus.util.AbstractAPI', {
    extend: 'Ext.util.Observable',
    requires: [
        'Ext.Ajax'
    ],

    config: {
        hostname: null,
        useSSL: false
    },

    //@private
    buildUrl: function(path) {
        var hostname = this.getHostname();
        return hostname ? (this.getUseSSL() ? 'https://' : 'http://')+hostname+path : path;
    },

    //@private
    buildParams: function(params) {
        return params || null;
    },

    //@private
    buildHeaders: function(headers) {
        return headers;
    },

    /**
     * This is the core function of this class which allows to consume API data ,by building
     * an HTTP request using all the params specified in the configuration and the one passed
     * to the function. When tha request is completed ,will be called the provided **success**
     * function if everything went fine including all the retrived data,
     * otherwise will be called the **exception** one.
     * @param {Object} options Unless otherwise noted ,options may include the following:
     * <ul>
     *
     * <li><b>url</b> : String
     * <div class="sub-desc">
     * The portion of the API url that will be append to the class baseUrl provided.
     * </div></li>
     *
     * <li><b>method</b> : String
     * <div class="sub-desc">
     * The HTTP method required to consume the requested API.
     * </div></li>
     *
     * <li><b>params</b> : Object
     * <div class="sub-desc">
     * The Object which includes all the params that need to be sended
     * over the HTTP in order to properly consume the requested API.
     * </div></li>
     *
     * <li><b>success</b> : Function
     * <div class="sub-desc">
     * The callback function to call if the API call succeed.
     * </div></li>
     *
     * <li><b>exception</b> : Function
     * <div class="sub-desc">
     * The callback function to call if the API call fails.
     * </div></li>
     *
     * <li><b>scope</b> : Object
     * <div class="sub-desc">
     * The callback functions scope object.
     * </div></li>
     *
     * </ul>
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