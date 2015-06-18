/*jslint browser: true, undef: true *//*global Ext*/
/**
 * Custom validator that allows validation by a function specified in the validator configuration.
 *
 * For the callback function to receive the rec parameter, fixes to Ext.data.Validation and Ext.data.field.Field
 * contained in the ext-5.1.1.451 branch of JarvusInnovations/sencha-hotfixes are currently required
 *
 * Example usage in model validators config:
 *
 *     @example
 *     validators: {
 *         passwordConfirmation: {
 *             type: 'callback',
 *             message: 'Passwords must match',
 *             callback: function(val, rec) {
 *                 return (val === rec.get('password');
 *             }
 *         }
 *     }
 */
Ext.define('SlateAdmin.validator.CallbackValidator', {
    extend: 'Ext.data.validator.Validator',
    alias: 'data.validator.callback',

    /**
     * @property type="callback"
     */
    type: 'callback',

    config: {
        /**
         * @cfg {String} message="not valid"
         * The error message to return when the callback function does not return true.
         */
        message: 'not valid',

        /**
         * @cfg {Function} callback (required)
         * The callback function used to evaluate the validity of the field.
         */
        callback: null
    },

    /**
     * Uses the callback function to determine the validity of the field.
     * @param val the field's value
     * @param rec the field's parent record
     */
    validate: function(val,rec) {
        var cb = this.getCallback();

        if (cb !== null && typeof cb === 'function') {
            return cb(val,rec) ? true : this.getMessage();
        }
        return 'CallbackValidator requires callback config parameter to be a function';
    }
});
