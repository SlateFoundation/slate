Ext.define('Slate.store.people.Students', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Person',
    config: {
        list: null,

        pageSize: 0,
        remoteSort: false,
        sorters: [{
            property: 'SortName',
            direction: 'ASC'
        }],
        proxy: {
            type: 'slate-people',
            url: '/people/*students',
            summary: true
        }
    },


    constructor: function() {
        this.callParent(arguments);
        this.dirty = true;
    },


    // config handlers
    updateList: function(list) {
        this.getProxy().setExtraParam('list', list || null);
        this.dirty = true;
    },


    // member methods
    loadIfDirty: function() {
        if (!this.dirty) {
            return;
        }

        this.dirty = false;
        this.load();
    },

    unload: function() {
        this.loadCount = 0;
        this.removeAll();
    }
});