Ext.define('EmergenceEditor.view.tab.Diff', {
    extend: 'Jarvus.ace.DiffPanel',
    xtype: 'emergence-tab-diff',
    mixins: [
        'EmergenceEditor.mixin.Tabbable'
    ],

    statics: {
        buildToken: function(config) {
            var from = config.leftPath,
                to = config.rightPath,
                fromRevision = config.leftRevision,
                toRevision = config.rightRevision;

            if (to == from) {
                to = '';
            }

            if (fromRevision) {
                from += '@' + fromRevision;
            }

            if (toRevision) {
                to += '@' + toRevision;
            }

            return 'from='+from+'&to='+to;
        },
        parseToken: function(token) {
            var query = Ext.Object.fromQueryString(token),
                from = query.from.split('@'),
                to = query.to.split('@'),
                fromPath = from[0],
                fromRevision = from[1] || null,
                toPath = to[0] || fromPath,
                toRevision = to[1] || null;

            return {
                leftPath: fromPath,
                leftRevision: fromRevision,
                rightPath: toPath,
                rightRevision: toRevision
            };
        }
    },


    // lifecycle methods
    getState: function() {
        return this.mixins.tabbable.getTabbableState.call(this);
    },

    buildFullToken: function() {
        return 'diff?' + this.getToken();
    },


    // config handlers
    updateLeftPath: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    },

    updateLeftRevision: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    },

    updateRightPath: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    },

    updateRightRevision: function () {
        this.callParent(arguments);
        this.setLoadNeeded(true);
    }
});