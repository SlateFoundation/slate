Ext.define('EmergenceEditor.view.tab.Editor', {
    extend: 'Jarvus.ace.Panel',
    xtype: 'emergence-tab-editor',
    mixins: [
        'EmergenceEditor.mixin.Tabbable'
    ],

    statics: {
        buildToken: function(config) {
            var token = config.path,
                revision = config.revision,
                line = config.line;

            if (revision) {
                token += '@'+revision;
            }

            if (line) {
                token += '$'+line;
            }

            return token;
        },
        parseToken: function(token) {
            var matches = token.match(/^([^\$@]+)(@([^\$]+))?(\$(\d+))?$/);

            if (!matches) {
                Ext.log.warn('Token could not be parsed: '+token);
            }

            return token ? {
                path: matches[1],
                revision: matches[3] || null,
                line: matches[5] || null
            } : null;
        }
    },


    isSavable: true,


    // lifecycle methods
    getState: function() {
        return this.mixins.tabbable.getTabbableState.call(this);
    },

    usableForToken: function(token) {
        var me = this,
            config = me.self.parseToken(token);

        return (
            config.path === me.getPath()
            && config.revision == me.getRevision()
        );
    },

    buildFullToken: function() {
        return '/' + this.getToken();
    },


    // config handlers
    updatePath: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    },

    updateRevision: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    }
});