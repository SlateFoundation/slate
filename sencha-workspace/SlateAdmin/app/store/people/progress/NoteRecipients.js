/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.people.progress.NoteRecipients', {
    extend: 'Ext.data.Store',
    requires: [
        'SlateAdmin.model.person.progress.NoteRecipient'
    ],


    model: 'SlateAdmin.model.person.progress.NoteRecipient',
    groupField: 'RelationshipGroup',
    sorters: [{
        sorterFn: function (p1, p2) {
            if (p1.get('RelationshipGroup') != 'Other' && p2.get('RelationshipGroup') != 'Other') {
                return 0;
            }

            if (p1.get('RelationshipGroup') != 'Other') {
                return 1;
            }

            if (p2.get('RelationshipGroup') != 'Other') {
                return -1;
            }

            return -1;
        }
    }]
});
