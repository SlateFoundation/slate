Ext.define('Jarvus.ext.override.util.InstantHistory', {
    override: 'Ext.util.History',

    // instantly update state
    setHash: function(hash) {
        this.callParent([hash]);
        this.handleStateChange(hash);
    },
    
    // force prevention of duplicate events
    handleStateChange: function(token) {   
        if(this.currentToken != token) {
            this.callParent([token]);
        }
    }
});
