/**
 * Provides a foundation for custom field components that contain arbitrary subcomponents and value logic
 *
 * Modeled after a combination of FieldContainer and field.Base
 */
Ext.define('Slate.ui.form.ContainerField', {
    extend: 'Ext.container.Container',
    xtype: 'slate-containerfield',
    mixins: {
        labelable: 'Ext.form.Labelable',
        field: 'Ext.form.field.Field'
    },
    requires: [
        'Ext.layout.component.field.FieldContainer'
    ],


    config: {
        readOnly: false
    },


    /**
     * @cfg {Boolean} encodeSubmitValue
     * True to JSON-encode values when submitting as form
     */
    encodeSubmitValue: true,

    readOnlyCls: Ext.baseCSSPrefix + 'form-readonly',


    // component rendering configuration
    componentCls: 'slate-containerfield',
    componentLayout: 'fieldcontainer',

    shrinkWrap: 2,

    autoEl: {
        tag: 'div',
        role: 'presentation'
    },

    childEls: [
        'containerEl'
    ],


    // labelable rendering configuration
    fieldSubTpl: [
        '<div id="{id}-containerEl" data-ref="containerEl" class="{containerElCls}"',
            '<tpl if="ariaAttributes">',
                '<tpl foreach="ariaAttributes"> {$}="{.}"</tpl>',
            '<tpl else>',
                ' role="presentation"',
            '</tpl>',
        '>',
            '{%this.renderContainer(out,values)%}',
        '</div>'
    ],


    // component lifecycle
    initComponent: function() {
        var me = this;

        me.callParent();

        // init mixins
        me.initLabelable();
        me.initField();
    },


    // config handlers
    updateReadOnly: function(readOnly) {
        this.toggleCls(this.readOnlyCls, readOnly);
    },


    // field lifecycle
    /**
     * @private
     * Copied from Ext.form.FieldContainer
     */
    initRenderData: function() {
        var me = this,
            data = me.callParent();

        data.containerElCls = me.containerElCls;
        data = Ext.applyIf(data, me.getLabelableRenderData());
        if (me.labelAlign === 'top' || me.msgTarget === 'under') {
            data.extraFieldBodyCls += ' ' + Ext.baseCSSPrefix + 'field-container-body-vertical';
        }
        data.tipAnchorTarget = me.id + '-containerEl';
        return data;
    },

    /**
     * @private
     * Copied from Ext.form.FieldContainer
     */
    getSubTplData: function() {
        var ret = this.initRenderData();

        Ext.apply(ret, this.subTplData);
        return ret;
    },

    /**
     * @private
     * Copied from Ext.form.FieldContainer
     */
    getSubTplMarkup: function(fieldData) {
        var me = this,
            tpl = me.lookupTpl('fieldSubTpl'),
            html;

        if (!tpl.renderContent) {
            me.setupRenderTpl(tpl);
        }

        html = tpl.apply(me.getSubTplData(fieldData));
        return html;
    },

    /**
     * @private
     * Copied from Ext.form.FieldContainer
     */
    getSubmitData: function() {
        var me = this,
            data = null,
            value;

        if (!me.disabled && me.submitValue) {
            data = {};
            value = me.getValue();

            if (me.encodeSubmitValue) {
                value = Ext.encode(value);
            } else {
                value = String(value);
            }

            data[me.getName()] = value;
        }

        return data;
    },

    markInvalid: function(errors) {
        this.setActiveErrors(errors);
    },

    clearInvalid: function() {
        this.unsetActiveError();
    },

    isValid: function() {
        return this.disabled ? true : this.validateValue(this.getValue());
    },

    validateValue: function(value) {
        var me = this,
            errors = me.getErrors(value),
            isValid = Ext.isEmpty(errors);

        if (!me.preventMark) {
            if (isValid) {
                me.clearInvalid();
            } else {
                me.markInvalid(errors);
            }
        }

        return isValid;
    },

    privates: {
        applyTargetCls: function(targetCls) {
            var containerElCls = this.containerElCls;

            this.containerElCls = containerElCls ? containerElCls + ' ' + targetCls : targetCls;
        },

        getTargetEl: function() {
            return this.containerEl;
        },

        initRenderTpl: function() {
            this.renderTpl = this.lookupTpl('labelableRenderTpl');
            return this.callParent();
        }
    }
});