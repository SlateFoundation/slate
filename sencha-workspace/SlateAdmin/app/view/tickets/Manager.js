/*jslint browser: true, undef: true *//*global Ext*/

Ext.define('SlateAdmin.view.tickets.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'tickets-manager',
    requires: [
        'SlateAdmin.view.tickets.Grid',
        'SlateAdmin.view.tickets.Details'
    ],


    // assets-manager config
    config: {
        selectedTicket: null
    },

    // container config
    layout: 'border',
    items: [{
        region: 'center',
        xtype: 'tickets-grid'
    },{
        split: true,
        region: 'east',
        xtype: 'tickets-details',
        width: 400,
        minWidth: 400,
        disabled: true
    }],


    // assets-manager methods
    // @private
    initComponent: function() {
        var me = this,
            detailCt,
            activityCt,
            assetDetails,
            form;
        
        me.callParent(arguments);
        
        me.detailCt = detailCt = me.down('tickets-details');
        me.activityCt = activityCt = me.down('tickets-activity');
        me.assetDetails = assetDetails = me.down('tickets-details-asset');
        me.detailsForm = form = me.down('tickets-details-form');
    },
    // @private
    updateSelectedTicket: function(ticket, oldTicket) {
        var me = this,
            detailCt = me.detailCt,
            detailsForm = me.detailsForm,
            activityCt = me.activityCt,   
            assetDetails = me.assetDetails,
            loadedTicket;

//        Ext.suspendLayouts();

        //update child components
        activityCt.updateSelectedTicket(ticket);
        detailsForm.updateSelectedTicket(ticket);
        assetDetails.updateTicket(ticket);
        
        if (ticket) {
            //update activity and form
            detailCt.enable();
        } else {
            detailCt.disable();            
        }

//        Ext.resumeLayouts();
    },
    
    // @private
    onDetailsFormEnabled: function(detailsForm) {
//        var me = this,
//            selectedAsset = me.getSelectedAsset(),
//            loadedAsset = detailsForm.getRecord();
//
//        if (!selectedAsset || !loadedAsset) {
//            return;
//        }
//
//        if (!loadedAsset || loadedAsset.getId() != selectedAsset.getId()) {
//            detailsForm.loadRecord(selectedAsset);
//        }
    },
    
    // @private
    onActivityCmpEnabled: function(activityCmp) {

    }

});