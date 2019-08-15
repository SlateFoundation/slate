/**
 * Wrapper for {@link Ext.window.Window} providing common configuration for its
 * use within Slate UIs
 */
Ext.define('Slate.ui.Window', {
    extend: 'Ext.window.Window',
    xtype: 'slate-window',
    requires: [
        'Slate.ui.PanelFooter'
    ],


    /**
     * @cfg {Boolean}
     * @inheritdoc Ext.tab.Panel#removePanelHeader
     * @localdoc True to remove header for any added mainView panel,
     * modeled after how tabpanel does the same
     */
    removeMainViewHeader: true,

    /**
     * @cfg {Boolean}
     * True to adopt any footer within mainView to the window itself.
     */
    adoptMainViewFooter: true,


    config: {

        /**
         * @cfg {Ext.Component|Object|String|null}
         *
         * A component, config, or xtype for a main view to add to the window
         */
        mainView: null,

        /**
         * @cfg {Slate.ui.PanelFooter|Ext.Component|Object|String|null}
         *
         * A component, config, or xtype for a footer component
         */
        footer: null,


        minWidth: 400,
        width: 560,
        minHeight: 200,
        scrollable: true,
        bodyStyle: {
            backgroundColor: '#f5f5f5'
        }
    },


    // window configuration
    shadow: 'frame',
    bodyPadding: 16,
    constrain: true,


    // component configuration
    componentCls: 'slate-window',


    // config handlers
    applyMainView: function(mainView) {
        if (mainView === null) {
            return mainView;
        }

        if (mainView === true) {
            mainView = {};
        } else if (typeof mainView == 'string') {
            mainView = {
                xtype: mainView
            };
        }

        return this.lookupComponent(mainView);
    },

    updateMainView: function(mainView, oldMainView) {
        var me = this,
            items = me.items,
            footer = mainView && mainView.down('slate-panelfooter');

        if (oldMainView) {
            oldMainView.un('titlechange', 'onMainViewTitleChange', me);
        }

        if (mainView && mainView.isPanel) {
            if (me.removeMainViewHeader) {
                if (mainView.rendered) {
                    if (mainView.header) {
                        mainView.header.hide();
                    }
                } else {
                    mainView.header = false;
                }
            }

            mainView.on('titlechange', 'onMainViewTitleChange', me);
        }

        if (mainView.border) {
            mainView.setBorder(false);
        }

        if (mainView.title) {
            me.setTitle(mainView.title);
        }

        if (footer && me.adoptMainViewFooter) {
            mainView.remove(footer, false);
            me.setFooter(footer);
        }

        if (items && items.isMixedCollection) {
            if (oldMainView) {
                me.remove(oldMainView);
            }

            if (mainView) {
                me.insert(0, mainView);
            }
        }
    },

    applyFooter: function(footer, oldFooter) {
        var configType = typeof footer;

        if (configType == 'boolean') {
            footer = {
                hidden: !footer
            };
        } else if (configType == 'string') {
            footer = {
                xtype: footer
            };
        } else if (Ext.isArray(footer)) {
            footer = {
                items: footer
            };
        }

        return Ext.factory(footer, 'Slate.ui.PanelFooter', oldFooter);
    },

    updateFooter: function(footer, oldFooter) {
        var me = this,
            items = me.items;

        if (items && items.isMixedCollection) {
            if (oldFooter) {
                me.remove(oldFooter);
            }

            if (footer) {
                me.addDocked(footer);
            }
        }
    },


    // container lifecycle
    initItems: function() {
        var me = this,
            mainView = me.getMainView(),
            footer = me.getFooter();

        me.callParent(arguments);

        if (mainView) {
            me.insert(0, mainView);
        }

        if (footer) {
            me.addDocked(footer);
        }
    },


    // event handlers
    onMainViewTitleChange: function(mainView, title) {
        this.setTitle(title);
    }
});