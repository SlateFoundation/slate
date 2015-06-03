/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Custom validator that allows validation by a function specified in the validator configuration.
 *
 * This current requires fixes to Ext.data.Validation and Ext.data.field.Field contained in
 * the ext-5.1.1.451 branch of JarvusInnovations/sencha-hotfixes
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
         * @cfg {Function} callback
         */
        callback: null
    },

    validate: function(val,rec) {
        var cb = this.getCallback();

        if (cb !== null && typeof cb === 'function') {
            return cb(val,rec) ? true : this.getMessage();
        }
        return 'CallbackValidator requires callback config parameter to be a function';
    }
});
