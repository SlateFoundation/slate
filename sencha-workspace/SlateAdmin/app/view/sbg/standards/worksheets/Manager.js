/*jslint browser: true, undef: true, white: false, laxbreak: true *//*global Ext,SlateAdmin*/
Ext.define('SlateAdmin.view.sbg.standards.worksheets.Manager', {
    extend: 'Ext.Container',
    xtype: 'sbg-standards-worksheets-manager',
    requires: [
        'SlateAdmin.view.sbg.standards.worksheets.Grid',
        'SlateAdmin.view.sbg.standards.worksheets.Editor'
    ],

    componentCls: 'sbg-standards-worksheets-manager',
    layout: 'border',
    worksheet: null,
    items: [{
        region: 'west',
        split: true,
        xtype: 'sbg-standards-worksheets-grid',
        autoScroll: true,
        width: 500
    },{
        region: 'center',
        xtype: 'sbg-standards-worksheets-editor',
        flex: 1
    }],


    //helper functions
    updateWorksheet: function(worksheet){
        if(!worksheet) {
            return false;
        }

        var editor = this.down('sbg-standards-worksheets-editor'),
            field = editor.down('textareafield[name=Description]');

        field.removeCls('dirty').addCls('saved');

        this.down('sbg-standards-worksheets-editor').loadRecord(worksheet);

        this.worksheet = worksheet;
    },
    getWorksheet: function(){
        return this.worksheet;
    }
});
