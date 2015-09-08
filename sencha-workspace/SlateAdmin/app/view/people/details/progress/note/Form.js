/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.note.Form',{
    extend: 'Ext.form.Panel',
    xtype: 'people-details-progress-note-form',

    padding: 5,
    border: false,
    hideLabels: true,
    items: [{
        xtype: 'textfield',
        name: 'Subject',
        anchor: '100%',
        emptyText: 'Subject',
        submitEmptyText: false
    },{
        xtype: 'htmleditor',
        name: 'Message',
        anchor: '100% -25',
        enableFont: false,
        enableFontSize: false
    }]
});
