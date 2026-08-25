Ext.define('SlateAdmin.store.courses.Departments', {
    extend: 'Ext.data.Store',

    model: 'SlateAdmin.model.course.Department',
    proxy: {
        type: 'slate-records',
        url: '/departments',
        startParam: false,
        limitParam: false
    }
});