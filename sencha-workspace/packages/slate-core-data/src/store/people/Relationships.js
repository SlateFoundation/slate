Ext.define('Slate.store.people.Relationships', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Relationship',
    config: {
        person: null,

        pageSize: 0,

        // redeclare identical proxy as model for dynamic reconfiguration
        proxy: 'slate-relationships',
    },


    constructor: function() {
        this.callParent(arguments);
        this.dirty = true;
    },


    // config handlers
    updatePerson: function(person) {
        this.getProxy().setExtraParam('person', person || null);
        this.dirty = true;
    },


    // member methods
    loadIfDirty: function(clearBeforeLoad, callback) {
        var me = this;

        if (!me.dirty) {
            callback.call(me, me.getRecords(), me, true);
            return false;
        }

        me.dirty = false;

        if (clearBeforeLoad) {
            me.unload();
        }

        me.load({ callback });
        return true;
    },

    unload: function() {
        this.loadCount = 0;
        this.removeAll();
    },
});