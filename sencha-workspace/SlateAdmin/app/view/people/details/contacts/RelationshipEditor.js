/**
 * Provides for editing relationship label+class
 */
 Ext.define('SlateAdmin.view.people.details.contacts.RelationshipEditor', {
    extend: 'Ext.Editor',
    requires: [
        'SlateAdmin.widget.field.contact.Relationship',
    ],


    config: {
        activeRelationship: null,
        isInverse: false,
    },


    // editor config
    updateEl: false,
    allowBlur: false,
    field: {
        xtype: 'slate-relationshipfield'
    },


    // config handlers
    updateIsInverse: function(isInverse) {
        var field = this.field;

        if (field.isComponent) {
            field.getLabelField().setFlipTrigger(!isInverse);
        } else {
            field.labelField = { flipTrigger: !isInverse };
        }
    },


    // editor lifecycle methods
    initComponent: function() {
        var me = this,
            labelField;

        me.callParent(arguments);

        labelField = me.field.getLabelField();
        me.mon(Ext.getBody(), 'mousedown', 'onBodyMouseDown', me);
        me.mon(labelField, 'select', 'onLabelFieldSelect', me);
        me.mon(labelField, 'specialkey', 'onFieldSpecialKey', me);
        me.mon(me.field.getClassField(), 'specialkey', 'onFieldSpecialKey', me);
    },

    startEdit: function() {
        var me = this,
            labelField = me.field.getLabelField();

        me.callParent(arguments);

        // automatically adjust offset
        if (!me.offsets.shifted) {
            me.offsets[1] -= me.field.getHeaderCmp().getHeight();
            me.offsets.shifted = true;
        }

        me.toggleCls('text-right', !me.getIsInverse());

        // HACK: align after start edit for first show and for dynamic offset above
        me.realign(true);

        // use current value for dirty detection
        labelField.resetOriginalValue();

        // focus+select main field
        labelField.focus(true, true);
    },


    // event handlers
    onBodyMouseDown: function(ev) {
        var me = this,
            picker = me.field.getLabelField().picker;

            if (
            !ev.within(me.field.el, false, true)
            && (
                !picker
                || !ev.within(picker.el, false, true)
            )
        ) {
            me.completeEdit();
        }
    },

    onLabelFieldSelect: function(field) {
        if (field.dirty) {
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
