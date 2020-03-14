Ext.define('Slate.store.people.Students', {
    extend: 'Slate.store.people.People',


    config: {
        list: null,

        proxy: {
            type: 'slate-people',
            url: '/people/*students',
            summary: true
        }
    },


    // config handlers
    updateList: function(list) {
        this.getProxy().setExtraParam('list', list || null);
        this.dirty = true;
    }
});