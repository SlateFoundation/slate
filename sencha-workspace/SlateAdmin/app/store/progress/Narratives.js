/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.progress.Narratives',{
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.progress.Narrative'
    ],

    autoLoad: false,
    autoSync: false,
    model: 'SlateAdmin.model.progress.Narrative',
    groupers: [{
        property: 'CourseSectionID'
    }],
    sorters: [{
        sorterFn: function (o1, o2) {
            var v1 = o1.get('Student').LastName,
                v2 = o2.get('Student').LastName;

            return v1 > v2 ? 1 : (v1 < v2 ? -1 : 0);
        }
    }]
});
