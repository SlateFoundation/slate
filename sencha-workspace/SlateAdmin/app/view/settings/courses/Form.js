/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.settings.courses.Form', {
    extend: 'Ext.window.Window',
    xtype: 'courses-form-window',

    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],

    config: {
        title: 'Create Course',
        modal: true,
        minWidth: 360,
        closeAction: 'hide',
        layout: 'fit'
    },

    items: [{
        xtype: 'form',
        bodyPadding: 12,
        items: [{
            fieldLabel: 'Title',
            name: 'Title',
            xtype: 'textfield',
            allowBlank: false
        },{
            fieldLabel: 'Code',
            name: 'Code',
            xtype: 'textfield',
            allowBlank: false
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
