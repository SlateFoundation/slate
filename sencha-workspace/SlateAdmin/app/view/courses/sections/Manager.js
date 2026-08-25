
/**
 * Container for course sections' grid and details view.
 *
 * Handles propagating changes to {@link #cfg-selectedSection} to active {@link SlateAdmin.view.courses.details.AbstractDetails details tab}
 */
Ext.define('SlateAdmin.view.courses.sections.Manager', {
    extend: 'SlateAdmin.view.AbstractRecordManager',
    xtype: 'courses-sections-manager',
    requires: [
        'SlateAdmin.view.courses.sections.Grid',
        'SlateAdmin.view.courses.sections.details.Profile',
        'SlateAdmin.view.courses.sections.details.Participants'
    ],


    // courses-sections-manager config
    config: {
        selectedSection: null
    },

    selectedRecordGetter: 'getSelectedSection',
    selectedRecordEvent: 'selectedsectionchange',
    tabRecordGetter: 'getLoadedSection',
    tabRecordSetter: 'setLoadedSection',


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
            },
            // detail tabs in explicit order — previously injected by each
            // module controller on beforerender, which made tab order an
            // accident of controller registration order in Application.js
            items: [{
                xtype: 'courses-sections-details-profile'
            },{
                xtype: 'courses-sections-details-participants'
            }]
        }]
    }],


    // courses-sections-manager methods
    // @private
    updateSelectedSection: function(section, oldSection) {
        this.syncSelectedRecord(section, oldSection);
    },

    // @private
    onSectionCommit: function() {
        var me = this;

        me.syncDetailHeader();
        me.fireEvent('sectioncommit', me, me.getSelectedSection());
    }
});
