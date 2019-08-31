/**
 * @abstract
 * An abstract class for singletons that facilitates communication with backend services on a local or remote emergence server
 */
Ext.define('Emergence.util.AbstractAPI', {
    extend: 'Jarvus.util.AbstractAPI',
    alternateClassName: 'Emergence.ext.util.AbstractAPI',

    config: {
        sessionData: null
    },


    /**
     * @event
     * Fires after successful login
     * @param {Object} sessionData
     */

    buildHeaders: function(headers) {
        headers = headers || {};

        if (!('Accept' in headers)) {
            headers.Accept = 'application/json';
        }

        return headers;
    },

    /**
     * Attempt to load session data
     * @param {String} hostname
     * @param {String} username
     * @param {String} password
     * @param {Function} callback A function to call and pass the new client data to when it is available
     * @param {Object} scope Scope for the callback function
     */
    loadSessionData: function(callback, scope) {
        var me = this;

        me.request({
            url: '/login',
            method: 'GET',
            success: function(response) {
                if (response.data && response.data.success) {
                    me.setSessionData(response.data.data);
                    Ext.callback(callback, scope, [true, response]);
                    me.fireEvent('login', response.data.data);
                } else {
                    Ext.callback(callback, scope, [false, response]);
                }
            },
            exception: function(response) {
                Ext.callback(callback, scope, [false, response]);
            }
        });
    },

    /**
     * Login to a remote Slate instance
     * @param {String} hostname
     * @param {String} username
     * @param {String} password
     * @param {Function} callback A function to call and pass the new client data to when it is available
     * @param {Object} scope Scope for the callback function
     */
    login: function(username, password, callback, scope) {
        var me = this;

        me.request({
            url: '/login',
            params: {
                '_LOGIN[username]': username,
                '_LOGIN[password]': password,
                '_LOGIN[returnMethod]': 'POST'
            },
            success: function(response) {
                if (response.data && response.data.success) {
                    me.setSessionData(response.data.data);
                    Ext.callback(callback, scope, [true, response]);
                    me.fireEvent('login', response.data.data);
                } else {
                    Ext.callback(callback, scope, [false, response]);
                }
            },
            exception: function(response) {
                Ext.callback(callback, scope, [false, response]);
            }
        });
    },

    /**
     * Logout from remote Slate instance
     * @param {Function} callback A function to call and pass the new client data to when it is available
     * @param {Object} scope Scope for the callback function
     */
    logout: function(callback, scope) {
        this.request({
            url: '/login/logout',
            success: function(response) {
                Ext.callback(callback, scope, [true, response]);
                this.fireEvent('logout', response.data);
            },
            exception: function(response) {
                Ext.callback(callback, scope, [false, response]);
            }
        });
    },

    /**
     * Upload an HTML5 file object
     * @param {Object} the html5 file object
     * @param {Function} the function to call after the response
     * @param {Object} the scope for the callback function
     */
    uploadMedia: function(file, callback, scope) {
        var me = this,
            formData = new FormData();

        formData.append('mediaFile', file);

        me.request({
            method: 'POST',
            url: '/media/upload',
            headers: {
                // Setting Content-Type to null allows the browser to automatically set Content-Type.
                // Must-have for file uploads using the FormData object.
                'Content-Type': null
            },
            rawData: formData,
            success: function(response) {
                var success = response.data && response.data.success,
                    mediaData = success && response.data.data;

                Ext.callback(callback, scope, [success, response, mediaData]);
            }
        });
    }
});
