Ext.define('Slate.store.Terms', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.Term',

    config: {
        pageSize: 0,
        sorters: [{
            property: 'Left',
            direction: 'ASC'
        }]
    }
});