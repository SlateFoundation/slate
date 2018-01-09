Ext.define('SlateAdmin.store.people.People', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.Person',
    config: {
        pageSize: 0
    }
});