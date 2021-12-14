Ext.define('Slate.ui.form.FlippableComboBox', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'slate-flippablecombobox',


    config: {
        flipTrigger: false
    },


    // config handlers
    updateFlipTrigger: function(flipTrigger) {
        var me = this;

        if (me.rendered) {
            me.triggerEl.item(0)[flipTrigger ? 'insertBefore' : 'insertAfter'](me.inputWrap);
        }
    },


    // component lifecycle
    onRender: function() {
        var me = this;

        me.callParent(arguments);

        if (me.getFlipTrigger()) {
            me.triggerEl.item(0).insertBefore(me.inputWrap);
        }
    }
});
