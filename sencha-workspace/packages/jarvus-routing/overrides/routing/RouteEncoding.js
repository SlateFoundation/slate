/**
 * Implement rewrite method for routes and add beforerewrite and beforeredirect app events that can be
 * cancelled to rewrite and/or asynchronously resume route handling
 */
Ext.define('Jarvus.routing.RouteEncoding', (function() {
    var unsafeCharacters = {
            '%' : '%25',
            '\\': '%5C',
            '#' : '%2F',
            '+' : '%2B',
            '"' : '%22',
            '{' : '%7B',
            '}' : '%7D',
            '[' : '%5B',
            ']' : '%5D',
            '<' : '%3C',
            '>' : '%3E',
            '|' : '%7C',
            '^' : '%5E',
            '~' : '%7E',
            '`' : '%60',
            ' ' : '+'
        },
        unsafeCharactersRe = new RegExp('['+Ext.String.escapeRegex(Ext.Object.getKeys(unsafeCharacters).join(''))+']', 'g');

    return {
        override: 'Ext.app.BaseController',
        requires: [
            'Jarvus.routing.PreprocessRedirect'
        ],

        redirectTo: function(originalToken) {
            if (originalToken.isModel) {
                originalToken = originalToken.toUrl();
            }

            if (Ext.isArray(originalToken)) {
                originalToken = this.encodeRouteArray(originalToken);
            }

            this.callParent([originalToken]);
        },


        /**
         * Convert an array of route components into a route

         * @param {Array} array The array to encode
         * @return {String} The encoded string
         */
        encodeRouteArray: function(array) {
            return Ext.Array.map(array, this.encodeRouteComponent).join('/');
        },

        /**
         * URL-encode any characters that would fail to pass through a hash path segment

         * @param {String} string The string to encode
         * @return {String} The encoded string
         */
        encodeRouteComponent: function(string) {
            return (Ext.isObject(string) ? Ext.Object.toQueryString(string) : (string||'')).replace(unsafeCharactersRe, function(match) {
                return unsafeCharacters[match];
            });
        },

        /**
         * URL-decode any characters that encodeRouteComponent encoded

         * @param {String} string The string to decode
         * @return {String} The decoded string
         */
        decodeRouteComponent: function(string) {
            return decodeURIComponent((string||'').replace(/\+/g, ' '));
        }
    };
})());