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
            xtype: 'panel',
            itemId: 'detailHeader',
            collapsible: true,
            titleCollapse: true,
            animCollapse: false,
            cls: 'data-header person-header',
            title: 'Person',
            tpl: [
                '<div class="photo-ct">',
                    '<tpl if="PrimaryPhotoID"><img src="/thumbnail/{PrimaryPhotoID}/84x84/cropped" width=84 height=84>',
                    '<tpl else><img src="/img/blank-avatar.png" width=84 height=84>',
                    '</tpl>',
                '</div>',
                '<dl class="kv-pairs">',
                    '<tpl if="Email"        ><div class="dli kv-pair"><dt class="kv-key">Email</dt>        <dd class="kv-value"><a href="mailto:{Email}">{Email}</a></dd></div></tpl>',
                    '<tpl if="Phone"        ><div class="dli kv-pair"><dt class="kv-key">Phone</dt>        <dd class="kv-value">{Phone}</dd></div></tpl>',
                    '<tpl if="Address"      ><div class="dli kv-pair"><dt class="kv-key">Address</dt>      <dd class="kv-value">{Address}</dd></div></tpl>',
                    '<tpl for="Advisor"     ><div class="dli kv-pair"><dt class="kv-key">Advisor</dt>      <dd class="kv-value">{FirstName} {LastName}</dd></div></tpl>',
                    '<tpl if="AccountLevel" ><div class="dli kv-pair"><dt class="kv-key">Account Level</dt><dd class="kv-value">{AccountLevel}</dd></div></tpl>',
                    '<tpl if="StudentNumber"><div class="dli kv-pair"><dt class="kv-key">Student&nbsp;#</dt>    <dd class="kv-value">{StudentNumber}</dd></div></tpl>',
                '</dl>'
            ]
        },{
            xtype: 'tabpanel',
            itemId: 'detailTabs',
            flex: 1
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

            if (detailCt.isDisabled()) {
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
        detailHeader.setTitle(person ? person.getDisplayName() : '');
    }
});