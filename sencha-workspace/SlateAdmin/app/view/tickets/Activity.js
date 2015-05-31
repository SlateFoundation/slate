Ext.define('SlateAdmin.view.tickets.Activity', {
    extend: 'SlateAdmin.view.AbstractActivity',
    xtype: 'tickets-activity',
    
    title: 'Activity Feed',
    
    config: {
        selectedTicket: null,
        emptyNoteFieldText: 'Leave a note about this ticket...'
    },

     //@private
    updateSelectedTicket: function(ticket, oldTicket) {
        var me = this,
            activityCmp = me.down('#activityCmp'),
            textArea = me.down('textareafield');
        
        textArea.reset();
        me.updateActivityData(ticket);   
        
    }
});