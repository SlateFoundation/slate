/**
 * Wrapper for {@link Ext.window.Window} providing common configuration for its
 * use within Slate UIs
 */
Ext.define('Slate.ui.Window', {
    extend: 'Ext.window.Window',
    xtype: 'slate-window',


    /**
     * @cfg {Boolean}
     * @inheritdoc Ext.tab.Panel#removePanelHeader
     * @localdoc True to remove header for any added mainView panel,
     * modeled after how tabpanel does the same
     */
    removeMainViewHeader: true,


    config: {

        /**
         * @cfg {Ext.Component|Object|String|null}
         *
         * A component, config, or xtype for a main view to add to the window
         */
        mainView: null,


        minWidth: 400,
        minHeight: 200
    },


    // window configuration
    shadow: 'frame',
    constrainHeader: true,


    // container configuration
    layout: 'fit',


    // component configuration
    componentClS: 'slate-window',


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
            items = me.items;

        if (oldMainView) {
            oldMainView.un('titlechange', 'onMainViewTitleChange', me);
        }

        if (mainView && mainView.isPanel && me.removeMainViewHeader) {
            if (mainView.rendered) {
                if (mainView.header) {
                    mainView.header.hide();
                }
            } else {
                mainView.header = false;
            }

            if (mainView.title) {
                me.setTitle(mainView.title);
            }

            mainView.on('titlechange', 'onMainViewTitleChange', me);
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


    // container lifecycle
    initItems: function() {
        var me = this,
            mainView = me.getMainView();

        me.callParent(arguments);

        if (mainView) {
            me.insert(0, mainView);
        }
    },


    // event handlers
    onMainViewTitleChange: function(mainView, title) {
        this.setTitle(title);
    }
});