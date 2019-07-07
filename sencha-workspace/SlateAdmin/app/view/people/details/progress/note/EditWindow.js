Ext.define('SlateAdmin.view.people.details.progress.note.EditWindow',{
    extend: 'Ext.window.Window',
    xtype: 'people-details-progress-note-editwindow',
    requires: [
        'Ext.layout.container.Border',
        'SlateAdmin.view.people.details.progress.note.RecipientGrid',
        'SlateAdmin.view.people.details.progress.note.Viewer',
        'SlateAdmin.view.people.details.progress.note.Form'
    ],

    config: {
        progressNote: null
    },

    layout: 'border',
    height: 500,
    width: 800,
    title: 'Compose Progress Note',
    bbar: [{
        xtype: 'button',
        text: 'Discard Changes',
        cls: 'glyph-danger',
        glyph: 0xf057, // fa-times-circle
        action: 'discardProgressNote'
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        text: 'Send &amp; Submit to Official Record',
        cls: 'glyph-accent',
        glyph: 0xf1d9, // fa-send-o
        action: 'sendProgressNote'
    }],
    modal: true,
    items: [{
        xtype: 'container',
        layout: 'card',
        region: 'center',
        itemId: 'progressNoteCt',
        items: [{
            xtype: 'people-details-progress-note-form'
        }, {
            xtype: 'people-details-progress-note-viewer'
        }]
    }, {
        xtype: 'people-details-progress-note-recipientgrid',
        width: 320,
        region: 'east'
    }],

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.noteCt = me.down('#progressNoteCt');
        me.noteForm = me.down('people-details-progress-note-form');
        me.noteViewer = me.down('people-details-progress-note-viewer');
    },

    updateProgressNote: function(progressNote) {
        var me = this;

        me.noteCt.getLayout().setActiveItem(progressNote && progressNote.phantom ? me.noteForm : me.noteViewer);

        if (progressNote && progressNote.phantom) {
            me.noteForm.loadRecord(progressNote);
        } else {
            me.noteViewer.update(progressNote || '');
        }
    },

    syncProgressNote: function() {
        var progressNote = this.getProgressNote();

        if (progressNote) {
            this.noteForm.updateRecord(progressNote);
        }

        return progressNote;
    }
});
