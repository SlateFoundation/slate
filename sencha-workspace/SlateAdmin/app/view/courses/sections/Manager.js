/*jslint browser: true, undef: true *//*global Ext*/

/**
 * Container for course sections' grid and details view.
 *
 * Handles propagating changes to {@link #cfg-selectedSection} to active {@link SlateAdmin.view.courses.details.AbstractDetails details tab}
 */
Ext.define('SlateAdmin.view.courses.sections.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'courses-sections-manager',
    requires: [
        'SlateAdmin.view.courses.sections.Grid'
    ],


    // courses-sections-manager config
    config: {
        selectedSection: null
    },

    /**
     * Reference to the detailCt {@link Ext.container.Container} subomponent
     */
    detailCt: null,

    /**
     * Reference to the detailHeader {@link Ext.panel.Panel} subomponent
     */
    detailHeader: null,

    /**
     * Reference to the detailTabs {@link Ext.tab.Panel} subcomponent
     */
    detailTabs: null,


    // container config
    layout: 'border',
    items: [{
        region: 'center',

        xtype: 'courses-sections-grid'
    },{
        region: 'east',

        xtype: 'container',
        itemId: 'detailCt',
        split: true,
        stateful: true,
        stateId: 'sectionDetails',
        disabled: true,
        width: 635,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'component',
            itemId: 'detailHeader',
            cls: 'data-header',
            bodyBorder: '0 0 1',
            tpl: [
                '<div class="record-image">',
                    '<tpl if="ThumbnailID">',
                        '<img src="/thumbnail/{ThumbnailID}/168x168/cropped" width=84 height=84>',
                    '</tpl>',
                '</div>',
                '<div class="record-data">',
                    '<h1 class="record-title">{Code}</h1>',
                    '<h2 class="record-subtitle">{Title}</h1>',
                '</div>'
            ]
        },{
            flex: 1,

            xtype: 'tabpanel',
            itemId: 'detailTabs',
            defaults: {
                bodyBorder: '1 0'
            }
        }]
    }],


    // courses-sections-manager methods
    // @private
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

    // @private
    updateSelectedSection: function(section, oldSection) {
        var me = this,
            detailCt = me.detailCt,
            detailTabs = me.detailTabs,
            activeTab = detailTabs.getActiveTab(),
            loadedSection;

        if (oldSection) {
//            oldSection.un('afterCommit', 'onSectionCommit', me); // TODO: models don't have events anymore in ExtJS 5, this will have to be done another way
        }

        Ext.suspendLayouts();
        me.syncDetailHeader();

        if (section) {
//            section.on('afterCommit', 'onSectionCommit', me); // TODO: models don't have events anymore in ExtJS 5, this will have to be done another way

            if (!activeTab) {
                activeTab = detailTabs.setActiveTab(0); // onBeforeTabChange will call setLoadedSection
            } else {
                activeTab.setLoadedSection(section);
            }

            if (activeTab && detailCt.isDisabled()) {
                detailCt.enable();

                // ensure active tab is set, since it would be supressed while disabled
                detailTabs.tabBar.setActiveTab(activeTab.tab);
            }
        } else {
            detailCt.disable();
        }

        me.fireEvent('selectedsectionchange', me, section, oldSection);

        Ext.resumeLayouts(true);
    },

    // @private
    onBeforeTabChange: function(detailTabs, activeTab) {
        var me = this,
            selectedSection = me.getSelectedSection(),
            tabLoadedSection = activeTab.getLoadedSection();

        if (!selectedSection || me.disabled) {
            return;
        }

        if (!tabLoadedSection || tabLoadedSection.getId() != selectedSection.getId()) {
            activeTab.setLoadedSection(selectedSection);
        }
    },

    // @private
    onDetailTabsEnable: function(detailTabs) {
        var me = this,
            activeTab = me.detailTabs.getActiveTab(),
            selectedSection = me.getSelectedSection(),
            tabLoadedSection = activeTab && activeTab.getLoadedSection();

        if (!selectedSection || !activeTab) {
            return;
        }

        if (!tabLoadedSection || tabLoadedSection.getId() != selectedSection.getId()) {
            activeTab.setLoadedSection(selectedSection);
        }
    },

    // @private
    onSectionCommit: function() {
        var me = this;

        me.syncDetailHeader();
        me.fireEvent('sectioncommit', me, me.getSelectedSection());
    },

    /**
     * Update detail header based on {@link #cfg-selectedSection}
     */
    syncDetailHeader: function() {
        var me = this,
            detailHeader = me.detailHeader,
            section = this.getSelectedSection();

        detailHeader.update(section ? section.getData() : '');
    }
});