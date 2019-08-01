/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.widget.field.contact.Postal', {
    extend: 'Ext.form.field.Picker',
    xtype: 'slate-postalfield',
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'SlateAdmin.widget.field.State'
    ],

    triggerCls: Ext.baseCSSPrefix + 'form-arrow-trigger',

    createPicker: function() {
        var me = this;

        return Ext.widget({
            xtype: 'form',
            floating: true,
            constrain: true,
            border: true,
            trackResetOnLoad: true,
            frame: true,
            ownerCt: me.ownerCt,
            layout: 'anchor',
            defaults: {
                anchor: '100%'
            },
            items: [
                {
                    xtype: 'textfield',
                    name: 'name',
                    margin: 5,
                    emptyText: 'C/O (optional)'
                },
                {
                    xtype: 'container',
                    margin: 5,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'number',
                            emptyText: '123',
                            maskRe: /\d/,
                            allowBlank: false,
                            margin: '0 5 0 0',
                            width: 50
                        },
                        {
                            xtype: 'textfield',
                            name: 'street',
                            emptyText: 'Street Rd',
                            allowBlank: false,
                            margin: '0 5 0 0',
                            flex: 1
                        },
                        {
                            xtype: 'textfield',
                            name: 'unit',
                            emptyText: 'Unit B',
                            width: 100
                        }
                    ]
                },
                {
                    xtype: 'container',
                    margin: 5,
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'city',
                            emptyText: 'Anytown',
                            margin: '0 5 0 0',
                            flex: 1
                        },
                        {
                            xtype: 'slate-statefield',
                            name: 'state',
                            margin: '0 5 0 0'
                        },
                        {
                            xtype: 'textfield',
                            name: 'postal',
                            emptyText: '12345',
                            maskRe: /\d/,
                            regex: /^\d{5}$/,
                            maxLength: 5,
                            enforceMaxLength: true,
                            width: 65
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: function() {
                        me.getPicker().getForm().reset();
                        me.collapse();
                    }
                },
                {
                    text: 'Save',
                    formBind: true,
                    handler: function() {
                        me.collapse();
                        
                        me.fireEvent('select', me, me.getSerializedData());
                    }
                }
            ],
            listeners: {
                scope: me,
                dirtychange: 'onFormDirtyChange'
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    },
    
    valueToRaw: function(value) {
        return value ? value.replace(/\n/g, ', ') : '';
    },
    
    onChange: function() {
        this.collapse();
        this.callParent(arguments);
    },
    
    mimicBlur: function(e) {
        if (!this.isEventWithinPickerForm(e)) {
            this.callParent(arguments);
        }
    },
    
    collapseIf: function(e) {
        if (!this.isEventWithinPickerForm(e)) {
            this.callParent(arguments);
        }
    },
    
    isEventWithinPickerForm: function(e) {
        var me = this,
            picker = me.picker,
            stateField = picker && picker.getForm().findField('state'),
            statePicker = stateField && stateField.picker;
        
        return statePicker && e.within(statePicker.el, false, true);
    },
    
    onFormDirtyChange: function(formPanel, dirty) {
        this.setReadOnly(dirty);
    },

    setSerializedData: function(serialized) {
        var form = this.getPicker().getForm(),
            fields = form.getFields().getRange(),
            values = {},
            fieldsLen = fields.length, i = 0, field;
        
        for (; i < fieldsLen; i++) {
            field = fields[i];
            
            values[field.getName()] = '';
        }
        
        if (serialized) {
            Ext.apply(values, Ext.decode(serialized));
        }
        
        form.setValues(values);
    },
    
    getSerializedData: function() {
        return Ext.encode(this.getPicker().getForm().getValues());
    }
});