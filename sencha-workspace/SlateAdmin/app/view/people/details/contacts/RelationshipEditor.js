/**
 * Provides for editing relationship label+class
 */
 Ext.define('SlateAdmin.view.people.details.contacts.RelationshipEditor', {
    extend: 'Ext.Editor',
    requires: [
        'SlateAdmin.widget.field.contact.Relationship',
    ],


    // editor config
    updateEl: false,
    allowBlur: false,
    field: {
        xtype: 'slate-relationshipfield'
    },


    // editor lifecycle methods
    startEdit: function() {
        var me = this;

        me.callParent(arguments);
        me.mon(Ext.getBody(), 'mousedown', 'onBodyMouseDown', me);
        me.mon(me.field.getLabelField(), 'specialkey', 'onFieldSpecialKey', me);
        me.mon(me.field.getClassField(), 'specialkey', 'onFieldSpecialKey', me);

        me.toggleCls('text-right', !me.activeIsInverse);

        // HACK: align after start edit for first show
        if (!me.realigned) {
            me.realign(true);
            me.realigned = true;
        }
    },

    completeEdit: function(remainVisible) {
        var me = this;

        me.callParent(arguments);
        me.mun(Ext.getBody(), 'mousedown', 'onBodyMouseDown', me);
        me.mun(me.field.getClassField(), 'specialkey', 'onFieldSpecialKey', me);
        me.mun(me.field.getClassField(), 'specialkey', 'onFieldSpecialKey', me);
    },


    // event handlers
    onBodyMouseDown: function(ev) {
        if (!ev.within(this.field.el, false, true)) {
            this.completeEdit();
        }
    },

    onFieldSpecialKey: function(field, ev) {
        var key = ev.getKey(),
            complete = key === ev.ENTER,
            cancel = key === ev.ESC;

        if (complete || cancel) {
            ev.stopEvent();

            if (complete) {
                this.completeEdit();
            } else {
                this.cancelEdit();
            }
        }
    }
});
