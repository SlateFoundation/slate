Ext.define('SlateAdmin.store.courses.Teachers', {
    extend: 'Ext.data.Store',

    model: 'Slate.model.person.Person',
    proxy: {
        type: 'slate-records',
        url: '/sections/*teachers',
        startParam: false,
        limitParam: false
    }
});