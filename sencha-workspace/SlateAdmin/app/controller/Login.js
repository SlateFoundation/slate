/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('SlateAdmin.controller.Login', {
    extend: 'Ext.app.Controller',


    // controller config
    views: [
        'LoginWindow'
    ],

    refs: [{
        ref: 'loginWindow',
        selector: 'slateadmin-loginwindow',
        autoCreate: true,

        xtype: 'slateadmin-loginwindow'
    }],

    control: {
        'slateadmin-loginwindow button[action=login]': {
            click: 'doLogin'
        },
        'slateadmin-loginwindow textfield': {
            specialkey: 'onLoginSpecialKey'
        }
    },

	// controller template methods
    init: function() {
        var me = this;

        me.application.on('sessionexpired', me.onSessionExpired, me);
    },


    // event handlers
    onSessionExpired: function(connection, response, options) {
        var loginWindow = this.getLoginWindow(),
            viewport = this.getViewport();

        loginWindow.setLastRequest(options);

        loginWindow.show(Ext.getBody(), function() {
            Ext.defer(function(){
                loginWindow.down('textfield[name=username]').focus();
            }, 100);
        });
    },

    onLoginSpecialKey: function(field, ev) {
        if(ev.getKey() == ev.ENTER) {
            this.doLogin();
        }
    },


    // controller methods
    doLogin: function() {
        var me = this,
            loginWindow = me.getLoginWindow(),
            values = loginWindow.down('form').getValues(),
            username = values.username,
            password = values.password,
            viewport = me.getViewport(),
            lastRequest = loginWindow.getLastRequest(),
            removeLoadmask = function() {
                this.getViewport().setMasked(false);
            };


        loginWindow.setLoading('Logging in&hellip;');
//
//      lastRequest.success = lastRequest.success ? Ext.Function.createSequence(lastRequest.success, removeLoadmask, me) : removeLoadmask;
//
        Ext.Ajax.request({
            url: '/login/json',
            method: 'POST',
            params: {
                '_LOGIN[username]': username,
                '_LOGIN[password]': password,
                '_LOGIN[returnMethod]': 'POST'
            },
            success: function(res) {
                var r = Ext.decode(res.responseText);

                loginWindow.setLoading(false);
                loginWindow.close();

                me.application.fireEvent('login');

//              Ext.Function.defer(Ext.Ajax.request, 1000, Ext.Ajax, [lastRequest]);
            },
            failure: function(res) {
                var r = Ext.decode(res.responseText);

                loginWindow.setLoading(false);
                Ext.Msg.alert('Login Failed', r && r.error ? r.error : 'Credentials rejected by server.');
            }
        });
    }
});