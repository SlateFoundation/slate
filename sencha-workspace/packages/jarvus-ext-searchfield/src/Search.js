/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Jarvus.ext.form.field.Search', {
    extend: 'Ext.form.field.Text',
    xtype: 'jarvus-searchfield',

    inputType: 'search',
    selectOnFocus: true,
    emptyText: 'Search…',

    initEvents: function() {
        var me = this;

        me.callParent();

        me.mon(me.inputEl, 'search', function(ev) {
            if (!me.getValue()) {
                me.fireEvent('clear', me, ev);
            }
        });
    }
});