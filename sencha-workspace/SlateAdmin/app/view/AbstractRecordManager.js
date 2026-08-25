/**
 * @abstract
 * Shared mechanics for the master/detail manager containers (people,
 * course sections): caches the detailCt/detailHeader/detailTabs
 * subcomponents, keeps the active detail tab's loaded record in sync with
 * the manager's selection, and renders the detail header from the
 * selected record.
 *
 * Subclasses declare their own selectedX config (their update handler
 * differs — see each) and set the accessor-name contract below so the
 * shared handlers can speak each module's config vocabulary.
 */
Ext.define('SlateAdmin.view.AbstractRecordManager', {
    extend: 'Ext.container.Container',


    // subclass contract
    selectedRecordGetter: null, // e.g. 'getSelectedPerson'
    selectedRecordEvent: null, // e.g. 'selectedpersonchange'
    tabRecordGetter: null, // e.g. 'getLoadedPerson' (on each detail tab)
    tabRecordSetter: null, // e.g. 'setLoadedPerson'

    /**
     * Reference to the detailCt {@link Ext.container.Container} subcomponent
     */
    detailCt: null,

    /**
     * Reference to the detailHeader {@link Ext.Component} subcomponent
     */
    detailHeader: null,

    /**
     * Reference to the detailTabs {@link Ext.tab.Panel} subcomponent
     */
    detailTabs: null,


    // component lifecycle
    initComponent: function() {
        var me = this,
            detailCt,
            detailTabs;

        me.callParent(arguments);

        me.detailCt = detailCt = me.down('#detailCt');
        me.detailHeader = detailCt.down('#detailHeader');
        me.detailTabs = detailTabs = detailCt.down('#detailTabs');

        detailTabs.on({
            scope: me,
            beforetabchange: 'onBeforeTabChange',
            enable: 'onDetailTabsEnable'
        });
    },


    // event handlers
    // @private
    onBeforeTabChange: function(detailTabs, activeTab) {
        var me = this,
            selectedRecord = me.getSelectedRecord(),
            tabRecord = activeTab[me.tabRecordGetter]();

        if (!selectedRecord || me.disabled) {
            return;
        }

        if (!tabRecord || tabRecord.getId() != selectedRecord.getId()) {
            activeTab[me.tabRecordSetter](selectedRecord);
        }
    },

    // @private
    onDetailTabsEnable: function() {
        var me = this,
            activeTab = me.detailTabs.getActiveTab(),
            selectedRecord = me.getSelectedRecord(),
            tabRecord = activeTab && activeTab[me.tabRecordGetter]();

        if (!selectedRecord || !activeTab) {
            return;
        }

        if (!tabRecord || tabRecord.getId() != selectedRecord.getId()) {
            activeTab[me.tabRecordSetter](selectedRecord);
        }
    },


    // component methods
    getSelectedRecord: function() {
        return this[this.selectedRecordGetter]();
    },

    /**
     * Activate a detail tab by itemId — the manager's public API for
     * controllers, replacing direct detailTabs reach-through
     */
    setActiveDetailTab: function(itemId) {
        this.detailTabs.setActiveTab(itemId);
    },

    /**
     * The active detail tab, falling back to the first tab
     */
    getActiveDetailTab: function() {
        var detailTabs = this.detailTabs;

        return detailTabs.getActiveTab() || detailTabs.items.getAt(0);
    },

    /**
     * Shared body for the subclasses' updateSelectedX handlers: syncs the
     * detail header, pushes the record into the active tab, disables
     * non-active tabs while the record is phantom, and fires the module's
     * selection-change event
     */
    syncSelectedRecord: function(record, oldRecord) {
        var me = this,
            detailCt = me.detailCt,
            detailTabs = me.detailTabs,
            tabBar = detailTabs.getTabBar(),
            activeTab = detailTabs.getActiveTab(),
            tabRecord;

        Ext.suspendLayouts();
        me.syncDetailHeader();

        if (record) {
            if (!activeTab) {
                activeTab = detailTabs.setActiveTab(0); // onBeforeTabChange will load the record
            } else if (!(tabRecord = activeTab[me.tabRecordGetter]()) || tabRecord.getId() != record.getId()) {
                activeTab[me.tabRecordSetter](record);
            }

            detailCt.setDisabled(!activeTab);

            Ext.Array.each(tabBar.query(':not([active])'), function (tab) {
                tab.setDisabled(record.phantom);
            });

            // ensure active tab is set, since it would be supressed while disabled
            if (activeTab) {
                tabBar.setActiveTab(activeTab.tab);
            }
        } else {
            detailCt.disable();
        }

        me.fireEvent(me.selectedRecordEvent, me, record, oldRecord);

        Ext.resumeLayouts(true);
    },

    /**
     * Update detail header from the selected record
     */
    syncDetailHeader: function() {
        var record = this.getSelectedRecord();

        this.detailHeader.update(record ? record.getData() : '');
    }
});
