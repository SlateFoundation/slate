/*jslint browser: true, undef: true *//*global Ext*/

/**
 * Container for people section's grid and details view.
 *
 * Handles propagating changes to {@link #cfg-selectedPerson} to active {@link SlateAdmin.view.people.details.AbstractDetails details tab}
 */
Ext.define('SlateAdmin.view.people.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'people-manager',
    requires: [
        'SlateAdmin.view.people.Grid'
    ],


    // people-manager config
    config: {
        selectedPerson: null
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
        flex: 3,

        xtype: 'people-grid'
    },{
        region: 'east',
        flex: 2,

        xtype: 'container',
        itemId: 'detailCt',
        split: true,
        stateful: true,
        stateId: 'personDetails',
        disabled: true,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'component',
            itemId: 'detailHeader',
            cls: 'data-header person-header',
            tpl: [
                '<div class="record-image">',
                    '<tpl if="PrimaryPhotoID"><img src="/thumbnail/{PrimaryPhotoID}/240x240/cropped" width=120 height=120>',
                    '<tpl else><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><path opacity=".2" d="M0 0h100v100H0z"/><path opacity=".5" fill="#fff" d="M95 93.9v6.1H5v-6.1c0-.5 0-1.2.1-2.1.1-.8.4-2.2 1-4.1s1.3-3.4 2.4-4.4c1-1.1 3-2.2 6-3.4 3-1.2 6.3-2.4 10-3.8 3.8-1.4 6.5-2.4 8.3-3.4 2.2-1.1 3.9-2.8 5.1-4.9.1-.1.1-.2.2-.3 1.1-2.1 1.6-4.2 1.6-6.6 0-1.5-1-3.5-2.9-5.7-2-2.2-3.4-5.3-4.7-9.2-1.2-3.9-1.8-8.4-1.8-13.3 0-3.9.5-7.1 1.5-10.2 1-2.9 2.4-5.3 4.3-7.1 1.8-1.8 3.9-3.1 6.2-4 2.3-.9 4.8-1.4 7.5-1.4s5.1.4 7.4 1.4c2.3.9 4.4 2.2 6.3 4 1.9 1.8 3.3 4.1 4.3 7.1 1.1 2.9 1.5 6.3 1.5 10.2 0 5-.6 9.5-1.7 13.3-1.1 3.9-2.7 6.9-4.7 9.2S60 59.3 60 60.9c0 2.2.5 4.4 1.7 6.6.1.1.1.2.2.3 1.3 2.2 2.9 3.9 5.1 5 1.7.9 4.5 2.1 8.3 3.4s7 2.6 10 3.9c2.9 1.2 5 2.3 5.9 3.4 1.1 1.1 1.8 2.4 2.4 4.2.6 1.8.9 3.3 1 4.6.2 0 .4 1.6.4 1.6z"/></svg>',
                    '</tpl>',
                '</div>',
                '<div class="record-data">',
                    '<h1 class="record-title">{FullName}</h1>',
                    '<h2 class="record-subtitle">{Username}</h1>',
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


    // people-manager methods
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
    updateSelectedPerson: function(person, oldPerson) {
        var me = this,
            detailCt = me.detailCt,
            detailTabs = me.detailTabs,
            tabBar = detailTabs.getTabBar(),
            activeTab = detailTabs.getActiveTab(),
            loadedPerson;

        Ext.suspendLayouts();
        me.syncDetailHeader();

        if (person) {
            if (!activeTab) {
                activeTab = detailTabs.setActiveTab(0); // onBeforeTabChange will call setLoadedPerson
            } else if (!(loadedPerson = activeTab.getLoadedPerson()) || loadedPerson.getId() != person.getId()) {
                activeTab.setLoadedPerson(person);
            }

            detailCt.setDisabled(!activeTab);

            Ext.Array.each(tabBar.query(':not([active])'), function (tab) {
                tab.setDisabled(person.phantom);
            });

            // ensure active tab is set, since it would be supressed while disabled
            if (activeTab) {
                tabBar.setActiveTab(activeTab.tab);
            }
        } else {
            detailCt.disable();
        }

        me.fireEvent('selectedpersonchange', me, person, oldPerson);

        Ext.resumeLayouts(true);
    },

    // @private
    onBeforeTabChange: function(detailTabs, activeTab) {
        var me = this,
            selectedPerson = me.getSelectedPerson(),
            tabLoadedPerson = activeTab.getLoadedPerson();

        if (!selectedPerson || me.disabled) {
            return;
        }

        if (!tabLoadedPerson || tabLoadedPerson.getId() != selectedPerson.getId()) {
            activeTab.setLoadedPerson(selectedPerson);
        }
    },

    // @private
    onDetailTabsEnable: function() {
        var me = this,
            activeTab = me.detailTabs.getActiveTab(),
            selectedPerson = me.getSelectedPerson(),
            tabLoadedPerson = activeTab && activeTab.getLoadedPerson();

        if (!selectedPerson || !activeTab) {
            return;
        }

        if (!tabLoadedPerson || tabLoadedPerson.getId() != selectedPerson.getId()) {
            activeTab.setLoadedPerson(selectedPerson);
        }
    },

    /**
     * Update detail header based on {@link #cfg-selectedPerson}
     */
    syncDetailHeader: function() {
        var me = this,
            detailHeader = me.detailHeader,
            person = this.getSelectedPerson();

        detailHeader.update(person ? person.getData() : '');
    }
});
