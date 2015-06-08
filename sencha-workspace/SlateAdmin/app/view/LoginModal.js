Ext.define('SlateAdmin.view.LoginModal', {
    extend: 'Ext.window.Window',
    
    xtype: 'slate-login-modal',
    
    modal: true, 
    
    items: [{
        xtype: 'form',
        layout: 'vbox',
        items: [{
            xtype: 'textfield',
            name: 'username',
            placeholder: 'Email or Username'
        }, {
            xtype: 'passwordfield',
            name: 'password',
            plaecholder: 'Password'
        }]
    }, {
        xtype: 'button',
        text: 'Login',
        action: 'handleLogin'
    }]
    
    
});