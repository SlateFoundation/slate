/**
 * A combination text+checkbox field for configuring a relationship label and class
 */
 Ext.define('SlateAdmin.widget.field.contact.Relationship', function() {
    const CLASS_RELATIONSHIP = 'Emergence\\People\\Relationship';
    const CLASS_GUARDIAN = 'Emergence\\People\\GuardianRelationship';

    return  {
        extend: 'Slate.ui.form.ContainerField',
        xtype: 'slate-relationshipfield',
        requires: [
            'Slate.ui.form.FlippableComboBox',
            'Ext.form.field.Checkbox'
        ],


        config: {
            headerCmp: true,
            labelField: true,
            classField: true
        },


        componentCls: 'slate-relationshipfield',
        defaultFocus: '#labelField',
        layout: {
            type: 'vbox',
            align: 'center'
        },
        items: [], // field items are added in initItems below


        // config handlers
        applyHeaderCmp: function(headerCmp, oldHeaderCmp) {
            if (!headerCmp || typeof headerCmp == 'boolean') {
                headerCmp = {
                    hidden: !headerCmp
                };
            }

            if (Ext.isSimpleObject(headerCmp)) {
                Ext.applyIf(headerCmp, {
                    flex: 1,

                    width: '100%',
                    tpl: '{FullName:htmlEncode}'
                });
            }

            return Ext.factory(headerCmp, 'Ext.Component', oldHeaderCmp);
        },

        applyLabelField: function(labelField, oldLabelField) {
            if (!labelField || typeof labelField == 'boolean') {
                labelField = {
                    hidden: !labelField
                };
            }

            if (Ext.isSimpleObject(labelField)) {
                Ext.applyIf(labelField, {
                    flex: 1,

                    name: 'Label',
                    store: 'people.RelationshipTemplates',
                    allowBlank: false,
                    queryMode: 'local',
                    valueField: 'label',
                    displayField: 'label',
                    triggerAction: 'all',
                    autoSelect: true,
                    selectOnFocus: true,
                });
            }

            return Ext.factory(labelField, 'Slate.ui.form.FlippableComboBox', oldLabelField);
        },

        updateLabelField: function(labelField, oldLabelField) {
            if (oldLabelField) {
                oldLabelField.un('change', 'syncValue', this);
            }

            if (labelField) {
                labelField.on('change', 'syncValue', this);
            }
        },

        applyClassField: function(classField, oldClassField) {
            if (!classField || typeof classField == 'boolean') {
                classField = {
                    hidden: !classField
                };
            }

            if (Ext.isSimpleObject(classField)) {
                Ext.applyIf(classField, {
                    flex: 1,

                    name: 'Class',
                    afterBoxLabelTextTpl: `&nbsp;<i class="fa fa-sm fa-shield glyph-guardian"></i>&nbsp;`,
                    boxLabel: 'Guardian',
                    inputValue: CLASS_GUARDIAN,
                    uncheckedValue: CLASS_RELATIONSHIP
                });
            }

            return Ext.factory(classField, 'Ext.form.field.Checkbox', oldClassField);
        },

        updateClassField: function(classField, oldClassField) {
            if (oldClassField) {
                oldClassField.un('change', 'syncValue', this);
            }

            if (classField) {
                classField.on('change', 'syncValue', this);
            }
        },


        // component lifecycle
        initItems: function() {
            var me = this;

            this.items = [
                me.getHeaderCmp(),
                me.getLabelField(),
                me.getClassField()
            ];

            me.callParent();
        },


        // containerfield lifecycle
        setValue: function(value) {
            var me = this;

            // update value and items map while loading into UI
            me.value = value;

            Ext.suspendLayouts();

            me.suspendValueSync = true;
            me.getLabelField().setValue(value.Label);
            me.getClassField().setValue(value.Class);
            me.suspendValueSync = false;

            Ext.resumeLayouts(true);

            // trigger change events if value differs from lastValue
            me.checkChange();
        },

        syncValue: function() {
            var me = this,
                value = me.value || (me.value = {});

            if (me.suspendValueSync) {
                return;
            }

            value.Class = me.getClassField().getSubmitValue();
            value.Label = me.getLabelField().getSubmitValue();

            me.checkChange();
        },

        isEqual: function(value1, value2) {
            if (!value1 && !value2) {
                return true;
            }

            if (!value1 || !value2) {
                return false;
            }

            if (value1.Class != value2.Class) {
                return false;
            }

            if (value1.Label != value2.Label) {
                return false;
            }

            return true;
        }
    };
});
