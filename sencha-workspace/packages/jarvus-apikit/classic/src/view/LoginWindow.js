Ext.define('Jarvus.view.LoginWindow', {
    extend: 'Ext.window.Window',
    singleton: true,


    title: 'Login Required',
    html: 'You\'ve either logged out or your has session expired. Please login and try again.',
    bodyPadding: 18,
    closable: false,
    buttons: [
        {
            text: 'Login',
            itemId: 'loginBtn',
            hrefTarget: '_blank'
        },
        {
            text: 'Try Again',
            itemId: 'retryBtn'
        },
        {
            text: 'Cancel',
            itemId: 'cancelBtn'
        }
    ],

    constructor: function() {
        this.callParent(arguments);
        this.retryQueue = [];
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);

        me.loginBtn = me.down('#loginBtn');
        me.retryBtn = me.down('#retryBtn').on('click', 'onRetryClick', me);
        me.cancelBtn = me.down('#cancelBtn').on('click', 'onCancelClick', me);
    },

    show: function(options) {
        var me = this;

        me.loginBtn.setHref(options.loginUrl);
        me.retryQueue.push(options);

        return me.callParent(arguments);
    },

    onRetryClick: function() {
        var queue = this.retryQueue,
            options;

        this.hide();

        while (queue.length) {
            options = queue.shift();
            options.connection.request(options.requestOptions);
        }
    },

    onCancelClick: function() {
        this.retryQueue.length = 0;
        this.hide();
    }
});