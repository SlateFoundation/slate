Ext.define('Slate.store.Locations', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.Location',

    config: {
        pageSize: 0,
        sorters: [{
            property: 'Left',
            direction: 'ASC'
        }]
    }
});