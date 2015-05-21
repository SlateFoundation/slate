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

        xtype: 'people-grid'
    },{
        region: 'east',

        xtype: 'container',
        itemId: 'detailCt',
        split: true,
        stateful: true,
        stateId: 'personDetails',
        disabled: true,
        width: 450,
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        items: [{
            xtype: 'component',
            itemId: 'detailHeader',
            cls: 'data-header person-header',
            bodyBorder: '0 0 1',
            tpl: [
                '<div class="record-image">',
                    '<tpl if="PrimaryPhotoID"><img src="/thumbnail/{PrimaryPhotoID}/168x168/cropped" width=84 height=84>',
                    '<tpl else><img src="/img/blank-avatar.png" width=84 height=84>',
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
            bodyStyle: {
                borderWidth: '1px 0 0'
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
            activeTab = detailTabs.getActiveTab(),
            loadedPerson;

        if (oldPerson) {
            oldPerson.un('afterCommit', 'syncDetailHeader', me);
        }

        Ext.suspendLayouts();
        me.syncDetailHeader();
            
        if (person) {
            person.on('afterCommit', 'syncDetailHeader', me);
    
            if (!activeTab) {
                activeTab = detailTabs.setActiveTab(0); // onBeforeTabChange will call setLoadedPerson
            } else if (!(loadedPerson = activeTab.getLoadedPerson()) || loadedPerson.getId() != person.getId()) {
                activeTab.setLoadedPerson(person);
            }

            if (activeTab && detailCt.isDisabled()) {
                detailCt.enable();
                
                // ensure active tab is set, since it would be supressed while disabled
                detailTabs.tabBar.setActiveTab(activeTab.tab);
            }
        } else {
            detailCt.disable();
        }

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
    onDetailTabsEnable: function(detailTabs) {
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