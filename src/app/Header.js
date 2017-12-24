/**
 * Standard header component for application dashboards
 */
Ext.define('Slate.ui.app.Header', {
    extend: 'Ext.Toolbar',
    xtype: 'slate-appheader',
    requires: [
        'Slate.ui.app.Title'
    ],


    config: {

        /**
         * @cfg {Ext.Compontent|String|boolean}
         *
         * String title for application or false to hide
         */
        title: null,
    },


    componentCls: 'slate-appheader',
    layout: {
        type: 'hbox',
        align: 'center'
    },


    // config handlers
    applyTitle: function(title, oldTitle) {
        if (title === null) {
            return title;
        }

        // eslint-disable-next-line vars-on-top
        var type = typeof title;

        if (type == 'boolean') {
            title = {
                hidden: !title
            };
        } else if (type == 'string') {
            title = {
                html: title,
                hidden: false
            };
        }

        return Ext.factory(title, 'Slate.ui.app.Title', oldTitle);
    },

    updateTitle: function(title, oldTitle) {
        var items = this.items;

        if (items && items.isMixedCollection) {
            if (oldTitle) {
                this.remove(oldTitle);
            }

            if (title) {
                this.insert(0, title);
            }
        }
    },


    // container lifecycle
    initItems: function() {
        var me = this,
            title = me.getTitle();

        me.callParent(arguments);

        if (title) {
            me.insert(0, title);
        }
    }
});