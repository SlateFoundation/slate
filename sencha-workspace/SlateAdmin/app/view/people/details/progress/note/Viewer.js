Ext.define('SlateAdmin.view.people.details.progress.note.Viewer',{
    extend: 'Ext.Component',
    xtype: 'people-details-progress-note-viewer',

    scrollable: true,
    padding: 20,
    tpl: [
        '<h3 class="Subject">{Subject}</h3><br>',
        '<span class="Message">{Message}</span>'
    ]
});
