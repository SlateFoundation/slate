Ext.define('Jarvus.util.DAVClient', {
    requires: [
        'Jarvus.util.API'
    ],
    mixins: [
        'Ext.mixin.Observable'
    ],


    config: {
        /**
         * @cfg The {Ext.data.Connection} instance that will process requests
         * @required
         */
        connection: 'Jarvus.util.API',

        /**
         * @cfg Optional base URI to prepend DAV paths with
         */
        baseUri: null
    },


    /**
     * Automatically inject "connection" class into requires
     */
    onClassExtended: function(cls, data, hooks) {
        var connection = data.connection || data.config && data.config.connection,
            onBeforeClassCreated;

        if (typeof connection === 'string') {
            onBeforeClassCreated = hooks.onBeforeCreated;

            hooks.onBeforeCreated = function() {
                var me = this,
                    args = arguments;

                Ext.require(connection, function() {
                    onBeforeClassCreated.apply(me, args);
                });
            };
        }
    },

    constructor: function(config) {
        var me = this;

        me.mixins.observable.constructor.call(me, config);
    },

    /**
     * Convert "connection" class into constructor reference
     */
    applyConnection: function(connection) {
        if (typeof connection == 'string') {
            Ext.syncRequire(connection);
            connection = Ext.ClassManager.get(connection);
        }

        return connection;
    },

    applyBaseUri: function(baseUri) {
        return baseUri ? baseUri.replace(/\/*$/, '') : null;
    },

    buildUrl: function(url) {
        var baseUri = this.getBaseUri();

        if (baseUri) {
            url = baseUri + '/' + url.replace(/^\/*/, '');
        }

        return url;
    },

    request: function(options) {
        options.url = this.buildUrl(options.url);

        return this.getConnection().request(options);
    },


    // DAV operations
    downloadFile: function(url, callback, scope) {
        var options = Ext.isString(url) ? { url: url } : url,
            headers = options.headers || (options.headers = {});

        if (options.revision) {
            headers['X-Revision-ID'] = options.revision;
        }

        if (!headers.Accept) {
            headers.Accept = '*/*';
        }

        return this.request(Ext.applyIf({
            method: 'GET',
            callback: callback,
            scope: scope
        }, options));
    },

    uploadFile: function(url, content, callback, scope) {
        var options = Ext.isString(url) ? { url: url } : url,
            headers = options.headers || (options.headers = {});

        if (options.ancestor) {
            headers['X-Ancestor-ID'] = options.ancestor;
        }

        return this.request(Ext.applyIf({
            method: 'PUT',
            rawData: content,
            callback: callback,
            scope: scope
        }, options));
    },

    move: function(url, toUrl, callback, scope) {
        var options = Ext.isString(url) ? { url: url } : url,
            headers = options.headers || (options.headers = {});

        headers.Destination = this.buildUrl(toUrl);

        return this.request(Ext.applyIf({
            method: 'MOVE',
            callback: callback,
            scope: scope
        }, options));
    },

    delete: function(url, callback, scope) {
        var options = Ext.isString(url) ? { url: url } : url;

        return this.request(Ext.applyIf({
            method: 'DELETE',
            callback: callback,
            scope: scope
        }, options));
    },

    createCollection: function(url, callback, scope) {
        var options = Ext.isString(url) ? { url: url } : url;

        return this.request(Ext.applyIf({
            method: 'MKCOL',
            callback: callback,
            scope: scope
        }, options));
    }
});