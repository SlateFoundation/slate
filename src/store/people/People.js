Ext.define('Slate.store.people.People', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Person',
    config: {
        pageSize: 0,
        remoteSort: false,
        sorters: [{
            property: 'SortName',
            direction: 'ASC'
        }],
        proxy: 'slate-people'
    },


    constructor: function() {
        this.callParent(arguments);
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