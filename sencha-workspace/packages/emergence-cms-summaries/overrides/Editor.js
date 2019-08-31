Ext.define('Emergence.overrides.cmssummaries.Editor', {
    override: 'Emergence.cms.view.Editor',
    requires: [
        'Emergence.cmssummaries.field.Summary'
    ],

    initComponent: function() {
        var editorView = this,
            summaryField = Ext.create('Emergence.cmssummaries.field.Summary', {
                dock: 'top',
                hidden: true
            });

        editorView.on({
            syncfromrecord: function(editorView, contentRecord) {
                summaryField.setValue(contentRecord.get('Summary'));
                summaryField.setHidden(contentRecord.get('Class') != 'Emergence\\CMS\\BlogPost');
            },
            synctorecord: function(editorView, contentRecord) {
                contentRecord.set('Summary', summaryField.getValue());
            }
        });

        editorView.callParent(arguments);

        editorView.addDocked(summaryField);
    }
});