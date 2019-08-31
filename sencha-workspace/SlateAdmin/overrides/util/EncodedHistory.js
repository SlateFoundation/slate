Ext.define('Jarvus.ext.override.util.EncodedHistory', (function() {
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
        override: 'Ext.util.History',
    
        add: function(token, preventDup) {
    
            if (Ext.data && Ext.data.Model && token instanceof Ext.data.Model && Ext.isFunction(token.toUrl)) {
                token = token.toUrl();
            }
    
            if (Ext.isArray(token)) {
                token = this.encodeRouteArray(token);
            }
    
            return this.callParent([token, preventDup]);
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
            return unescape((string||'').replace(/\+/g, ' '));
        }
    };
})());