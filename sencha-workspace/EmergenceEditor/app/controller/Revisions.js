/**
 * Controls revisions sidebar
 *
 * Responsibilities:
 * - Load and clear Revisions store as needed in response to tab switching
 * - Open file revision on double-click
 * - Show revision menu on context click and handle all items on it
 */
Ext.define('EmergenceEditor.controller.Revisions', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'tab.Diff',
        'menu.Revision'
    ],

    stores: [
        'Revisions'
    ],

    refs: {
        tabPanel: 'emergence-tabpanel',
        revisionsGrid: 'emergence-revisionsgrid',

        menu: {
            autoCreate: true,

            xtype: 'emergence-menu-revision'
        },
        openMenuItem: 'emergence-menu-revision menuitem[action=revision-open]',
        propertiesMenuItem: 'emergence-menu-revision menuitem[action=revision-properties]',
        compareLatestMenuItem: 'emergence-menu-revision menuitem[action=revision-compare-latest]',
        compareNextMenuItem: 'emergence-menu-revision menuitem[action=revision-compare-next]',
        comparePreviousMenuItem: 'emergence-menu-revision menuitem[action=revision-compare-previous]'
    },

    control: {
        tabPanel: {
            tabchange: 'onTabChange'
        },
        revisionsGrid: {
            expand: 'onRevisionsGridExpand',
            itemdblclick: 'onRevisionDoubleClick',
            itemcontextmenu: 'onRevisionContextMenu'
        },
        openMenuItem: {
            click: 'onOpenClick'
        },
        compareLatestMenuItem: {
            click: 'onCompareLatestClick'
        },
        compareNextMenuItem: {
            click: 'onCompareNextClick'
        },
        comparePreviousMenuItem: {
            click: 'onComparePreviousClick'
        },
    },


    // event handlers
    onTabChange: function(tabPanel, card) {
        var revisionsGrid = this.getRevisionsGrid(),
            revisionsStore = this.getRevisionsStore(),
            revisionsProxy = revisionsStore.getProxy(),
            path, revision;

        if (card.isXType('emergence-tab-editor')) {
            path = card.getPath();
            revision = card.getRevision();
        } else if (card.isXType('emergence-tab-diff')) {
            path = card.getLeftPath();

            if (path == card.getRightPath()) {
                revision = card.getRightRevision();
            } else {
                path = null;
            }
        }

        if (path) {
            revisionsProxy.setExtraParam('path', path);
            revisionsGrid.enable();

            if (!revisionsGrid.getCollapsed() && revisionsProxy.isExtraParamsDirty()) {
                revisionsStore.load({
                    callback: function() {
                        revisionsGrid.setSelection(revisionsStore.getById(revision));
                    }
                });
            } else {
                revisionsGrid.setSelection(revisionsStore.getById(revision));
            }
        } else {
            revisionsStore.removeAll();
            revisionsProxy.setExtraParams({});
            revisionsProxy.clearParamsDirty();
            revisionsGrid.disable();
        }
    },

    onRevisionsGridExpand: function() {
        var revisionsStore = this.getRevisionsStore();

        if (revisionsStore.getProxy().isExtraParamsDirty()) {
            revisionsStore.load();
        }
    },

    onRevisionDoubleClick: function(gridView, revision) {
        this.redirectTo(revision);
    },

    onRevisionContextMenu: function(revisionsGrid, revision, itemDom, index, event) {
        var me = this,
            menu = me.getMenu();

        event.stopEvent();

        menu.setRevision(revision);

        me.getCompareLatestMenuItem().setDisabled(index == 0);
        me.getCompareNextMenuItem().setDisabled(index == 0);
        me.getComparePreviousMenuItem().setDisabled(index + 1 == revisionsGrid.getStore().getCount());

        menu.showAt(event.getXY());
    },

    onOpenClick: function() {
        this.redirectTo(this.getMenu().getRevision());
    },

    onCompareLatestClick: function() {
        var me = this,
            store = me.getRevisionsStore(),
            revision = this.getMenu().getRevision();

        this.redirectToDiff(revision, store.getAt(0));
    },

    onCompareNextClick: function() {
        var me = this,
            store = me.getRevisionsStore(),
            revision = this.getMenu().getRevision();

        this.redirectToDiff(revision, store.getAt(store.indexOf(revision)-1));
    },

    onComparePreviousClick: function() {
        var me = this,
            store = me.getRevisionsStore(),
            revision = this.getMenu().getRevision();

        this.redirectToDiff(store.getAt(store.indexOf(revision)+1), revision);
    },


    // local methods
    redirectToDiff: function(leftRevision, rightRevision) {
        this.redirectTo('diff?' + this.getTabDiffView().buildToken({
            leftPath: leftRevision.get('FullPath'),
            leftRevision: leftRevision.getId(),
            rightPath: rightRevision.get('FullPath'),
            rightRevision: rightRevision.getId()
        }));
    }
});