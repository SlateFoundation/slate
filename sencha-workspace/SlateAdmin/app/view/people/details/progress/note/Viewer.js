/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,Slate*/
Ext.define('SlateAdmin.view.people.details.progress.note.Viewer',{
    extend: 'Ext.Container',
    xtype: 'people-details-progress-note-viewer',

    autoScroll: true,
    tpl: [
        '<h3 class="Subject">{Subject}</h3><br>',
        '<span class="Message">{Message}</span>'
    ]
});
