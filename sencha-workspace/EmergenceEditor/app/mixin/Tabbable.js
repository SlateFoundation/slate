/**
 * Mix in to any component that will be added to the editor's tab panel to help adapt it to token-based navigation
 */
Ext.define('EmergenceEditor.mixin.Tabbable', {
    extend: 'Ext.Mixin',

    mixinConfig: {
        id: 'tabbable'
    },


    isTabbable: true,
    isSavable: false,

    config: {
        token: null,
        loadNeeded: null,

        // set for TabPanel
        closable: true
    },


    updateToken: function(token, oldToken) {
        var me = this,
            config = me.self.parseToken(token);

        me.setConfig(config);

        me.fireEvent('tokenchange', me, config, token, oldToken);
    },

    updateLoadNeeded: function(loadNeeded) {
        var me = this;

        me.fireEvent('loadneededchange', me, loadNeeded);
    },

    getTabbableState: function() {
        var me = this;

        return {
            xtype: me.getXType(),
            title: me.getInitialConfig('title'),
            token: me.getToken()
        }
    },

    usableForToken: function(token) {
        return this.getToken() === token;
    },

    buildFullToken: function() {
        return this.getToken();
    }
});