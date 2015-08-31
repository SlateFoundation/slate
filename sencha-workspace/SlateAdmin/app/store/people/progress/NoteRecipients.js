/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.store.people.progress.NoteRecipients', {
    extend: 'Ext.data.Store',
	
	requires: [
		'SlateAdmin.model.person.progress.NoteRecipient'	
	],
	groupField: 'RelationshipGroup',
	model: 'SlateAdmin.model.person.progress.NoteRecipient'
});
