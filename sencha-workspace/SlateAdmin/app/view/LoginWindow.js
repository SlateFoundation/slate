/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.view.LoginWindow', {
    extend: 'Ext.Window',
    xtype: 'slateadmin-loginwindow',
    requires: [
        'Ext.form.Panel'
    ],

    title: 'Log in to Slate',
    lastRequest: null,
    modal: true,
    resizable: false,
    closable: false,
    width: 300,
    layout: 'fit',
    items: {
        xtype: 'form',
        bodyPadding: 10,
        defaults: {
            anchor: '100%',
            selectOnFocus: true
        },
        items: [{
            xtype: 'displayfield',
            value: 'Your last action was not completed due to a session timeout. Please log in again to retain the data entered and retry.'
        },{
            xtype: 'textfield',
            name: 'username',
            fieldLabel: 'Username',
            allowBlank: false
        },{
            xtype: 'textfield',
            name: 'password',
            fieldLabel: 'Password',
            inputType: 'password',
            allowBlank: false
        }],
        buttons: [{
            text: 'Log In',
            action: 'login',
            formBind: true
        }]
    },

    setLastRequest: function(lastRequest) {
        this.lastRequest = lastRequest;
    },

    getLastRequest: function() {
        return this.lastRequest;
    }
});