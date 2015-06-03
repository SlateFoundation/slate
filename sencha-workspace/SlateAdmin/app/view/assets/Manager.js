/*jslint browser: true, undef: true *//*global Ext*/

Ext.define('SlateAdmin.view.assets.Manager', {
    extend: 'Ext.container.Container',
    xtype: 'assets-manager',
    requires: [
        'SlateAdmin.view.assets.Grid',
        'SlateAdmin.view.assets.Details'
    ],


    // assets-manager config
    config: {
        selectedAsset: null
    },

    // container config
    layout: 'border',
    
    items: [{
        region: 'center',
        xtype: 'assets-grid' 
    },{
        split: true,
        region: 'east',
        xtype: 'assets-details',
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
            ticketsGrid,
            form;
        
        me.callParent(arguments);
        
        
        
        me.detailCt = detailCt = me.down('assets-details');
        me.activityCt = activityCt = me.down('assets-activity');
        me.ticketsGrid = ticketsGrid = me.down('assets-ticketsgrid');
        
        me.detailsForm = form = me.down('#details-form');
        
        activityCt.on({
            scope: me,
            enable: 'onActivityCmpEnabled'
        });
        
        form.on({
            scope: me,
            enable: 'onDetailsFormEnabled'
        });
    },
    // @private
    updateSelectedAsset: function(asset, oldAsset) {
        var me = this,
            detailCt = me.detailCt,
            detailsForm = me.detailsForm,
            activityCt = me.activityCt,
            ticketsGrid = me.ticketsGrid,
            loadedAsset;

        Ext.suspendLayouts();
        
        //update child components
        activityCt.updateSelectedAsset(asset);
        detailsForm.updateSelectedAsset(asset);
        ticketsGrid.updateAsset(asset);
        
        if (asset) {
            //update activity and form
            detailCt.enable();
        } else {
            //disable form and collapse panels or disable scrolling??
            detailCt.disable();            
        }

        Ext.resumeLayouts(true);
    },
    
    // @private
    onDetailsFormEnabled: function(detailsForm) {
        var me = this,
            selectedAsset = me.getSelectedAsset(),
            loadedAsset = detailsForm.getRecord();

        if (!selectedAsset || !loadedAsset) {
            return;
        }

        if (!loadedAsset || loadedAsset.getId() != selectedAsset.getId()) {
            detailsForm.loadRecord(selectedAsset);
        }
    },
    
    // @private
    onActivityCmpEnabled: function(activityCmp) {
//        var me = this,
//            selectedAsset = me.getSelectedAsset(),
//            selectedAssetActivity = selectedAsset ? selectedAsset.getAssociations().Activities : null,
//            loadedAssetActivity = me.activityCt.getSelectedAsset() ? me.activityCt.getSelectedAsset().getAssociations().Activities : null;
//
//        if (!selectedAssetActivity || !loadedAssetActivity) {
//            return;
//        }
//
//        if (!loadedAssetActivity || loadedAssetActivity != selectedAssetActivity) {
////            activityCmp.update(selectedAssetActivity);
//            
//        }
    }

});