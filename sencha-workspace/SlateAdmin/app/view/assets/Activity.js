Ext.define('SlateAdmin.view.assets.Activity', {
    extend: 'SlateAdmin.view.AbstractActivity',
    xtype: 'assets-activity',
//    requires: [
//        'Ext.XTemplate'
//    ],
    
    title: 'Activity Feed',
    
    config: {
        selectedAsset: null,
        emptyNoteFieldText: 'Leave a note for this asset.'
    },
    
     //@private
    updateSelectedAsset: function(asset, oldAsset) {
        var me = this,
            activityCmp = me.down('#activityCmp'),
            textArea = me.down('textareafield');
        
        textArea.reset();
        me.updateActivityData(asset);   
        
    }
    
});