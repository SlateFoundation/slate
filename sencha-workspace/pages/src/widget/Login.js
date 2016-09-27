/*jslint browser: true, undef: true *//*global Ext*/
Ext.define('Site.widget.Login', {
    singleton: true,
    requires: [
        'Ext.DomHelper'
    ],
    
    config: {
        loginLinkSelector: 'a[href^="/login"]',
        loginModalId: 'login-modal'
    },

    constructor: function(config) {
        var me = this;
        
        me.callParent(arguments);
        me.initConfig(config);
        
        Ext.onReady(me.onDocReady, me);
    },
    
    onDocReady: function() {
        var me = this,
            body = Ext.getBody(),
            loginModal = me.loginModal = Ext.get(me.getLoginModalId()),
            loginForm = me.loginForm = loginModal && loginModal.down('form');

        if (!loginModal) {
            return;
        }

        loginModal.enableDisplayMode();

        body.on('keyup', 'onBodyKeyup', me);
        body.on('click', 'onLoginLinkClick', me, { delegate: me.getLoginLinkSelector() });
        loginModal.on('click', 'hide', me, { delegate: '[data-action="close"]' });
        loginForm.on('submit', 'onLoginSubmit', me);
    },

    hide: function() {
        this.loginModal.hide();
        Ext.getBody().removeCls('blurred');
    },
    
    show: function() {
        Ext.getBody().addCls('blurred');
        this.loginModal.show();
    },

    onBodyKeyup: function(ev, t) {
        if (ev.getKey() == ev.ESC) {
            this.hide();
        }
    },

    onLoginLinkClick: function(ev, t) {
        var me = this;
        
        ev.preventDefault();
        me.show();
        me.loginForm.down('input[autofocus]').focus();
    },

    onLoginSubmit: function(ev, t) {
        var loginForm = this.loginForm;

        ev.preventDefault();
        loginForm.addCls('waiting');

        Ext.Ajax.request({
            url: '/login/?format=json',
            method: 'POST',
            form: loginForm,
            success: function(response) {
                window.location.reload();
            },
            failure: function(response) {
                loginForm.dom.action = '/login?_LOGIN[return]='+encodeURIComponent(location.pathname + location.search);
                loginForm.dom.submit();
            }
        });
    }
});