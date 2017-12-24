Ext.define('Slate.ui.app.Container', {
    extend: 'Ext.Container',
    xtype: 'slate-appcontainer',
    requires: [
        'Slate.ui.app.Header',
        'Slate.ui.Placeholder'
    ],


    config: {

        /**
         * @cfg {boolean}
         * Whether app should be full-width or padded
         */
        fullWidth: false,

        /**
         * @cfg {Slate.ui.app.Header|Object|string|boolean}
         * Instance or configuration for header component.
         *
         * Setting boolean values change visibility.
         */
        header: null,

        /**
         * @cfg {Slate.ui.Placeholder|Object|string|boolean}
         * Instance or configuration for placeholder component.
         *
         * Setting boolean values change visibility.
         */
        placeholder: null,
    },


    // component properties
    componentCls: 'slate-appcontainer',

    childEls: [
        'bodyWrap'
    ],

    renderTpl: [
        '{% Ext.DomHelper.generateMarkup(values.$comp.getHeader().getRenderTree(), out); %}',
        '<div id="{id}-bodyWrap" data-ref="bodyWrap" class="slate-appcontainer-bodyWrap">',
        '    {% this.renderContainer(out, values); %}',
        '</div>',
    ],


    // config handlers
    updateFullWidth: function(fullWidth) {
        this.toggleCls('slate-appcontainer-fullwidth', fullWidth);
        this.toggleCls('slate-appcontainer-padded', !fullWidth);
    },

    applyHeader: function(header, oldHeader) {
        if (typeof header === 'boolean') {
            header = {
                hidden: !header
            };
        } else if (typeof header === 'string') {
            header = {
                title: header
            };
        }

        return Ext.factory(header, 'Slate.ui.app.Header', oldHeader);
    },

    updateHeader: function(header, oldHeader) {
        var me = this;

        if (oldHeader) {
            delete oldHeader.ownerCt;
        }

        if (header) {
            header.ownerCt = me;

            if (me.rendered) {
                header.render(me.el, me.bodyWrap);
                header.updateLayout({ isRoot: true });
            }
        }
    },

    applyPlaceholder: function(placeholder, oldPlaceholder) {
        var type = typeof placeholder;

        if (type == 'boolean') {
            placeholder = {
                hidden: !placeholder
            };
        } else if (type == 'string') {
            placeholder = {
                html: placeholder
            };
        }

        return Ext.factory(placeholder, 'Slate.ui.Placeholder', oldPlaceholder);
    },

    updatePlaceholder: function(placeholder, oldPlaceholder) {
        var items = this.items;

        if (items && items.isMixedCollection) {
            if (oldPlaceholder) {
                this.remove(oldPlaceholder);
            }

            if (placeholder) {
                this.insert(0, placeholder);
            }
        }
    },


    // container lifecycle
    initItems: function() {
        var me = this,
            placeholder = me.getPlaceholder();

        me.callParent(arguments);

        if (placeholder) {
            me.insert(0, placeholder);
        }
    },

    getRefItems: function(deep) {
        var header = this.getHeader(),
            items = this.callParent(arguments);

        if (header) {
            if (deep) {
                items.unshift(...header.getRefItems(deep));
            }
            items.unshift(header);
        }

        return items;
    },

    privates: {
        finishRender: function () {
            this.callParent(arguments);
            this.getHeader().finishRender();
        }
    },
});