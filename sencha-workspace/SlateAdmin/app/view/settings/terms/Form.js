/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.terms.Form', {
    extend: 'Ext.window.Window',
    xtype: 'terms-form-window',

    requires: [
        'Ext.form.field.Text',
        'Ext.form.field.Date'
    ],

    config: {
        title: 'Create Term',
        modal: true,
        minWidth: 360,
        closeAction: 'hide',
        layout: 'fit',
        parentTerm: null
    },

    items: [{
        xtype: 'form',
        bodyPadding: 12,
        items: [{
            fieldLabel: 'Parent',
            name: 'ParentDisplay',
            xtype: 'displayfield'
        },{
            fieldLabel: 'Title',
            name: 'Title',
            xtype: 'textfield',
            allowBlank: false
        },{
            fieldLabel: 'Start Date',
            name: 'StartDate',
            xtype: 'datefield',
            format :'Y-m-d',
            allowBlank: true
        },{
            fieldLabel: 'End Date',
            name: 'EndDate',
            xtype: 'datefield',
            format :'Y-m-d',
            allowBlank: true
        },{
            name: 'ParentID',
            xtype: 'hidden',
            value: null
        },{
            name: 'TitlesPath',
            xtype: 'hidden',
            value: null
        }]
    }],

    buttons: [{
        text: 'Cancel',
        handler: function(button) {
            button.up('window').close();
        }
    },'->',{
        text: 'Save',
        action: 'save'
    }]

});
