Ext.define('Slate.store.people.GlobalRecipients', {
    extend: 'Ext.data.Store',


    model: 'Slate.model.person.GlobalRecipient',
    config: {
        pageSize: 0
    }
});