/*jslint browser: true, undef: true *//*global Ext,Slate*/
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