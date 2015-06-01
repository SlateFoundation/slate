/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Validates that the passed value is not `null` or `undefined` or `''`.
 */
Ext.define('SlateAdmin.validator.CallbackValidator', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.callback',

    type: 'callback',

    config: {
        /**
         * @cfg {String} message
         * The error message to return when the value is not specified.
         */
        message: 'not valid',

        /**
         * @cfg {Function} fn
         * `true` to allow `''` as a valid value.
         */
        callback: null,
        allowEmpty: false
    },

    validate: function(val) {
        var cb = this.getCallback();

        if (cb !== null && typeof cb === 'function') {
            return cb(val) ? true : this.getMessage();
        }
        return 'CallbackValidator requires callback config parameter to be a function';
    }
});
