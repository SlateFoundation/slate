Ext.define('Jarvus.view.LoginWindow', {
    extend: 'Ext.MessageBox',
    singleton: true,


    config: {
        loginUrl: null,

        title: 'Login Required',
        message: 'You\'ve either logged out or your has session expired. Please login and try again.',
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
        modal: true,
        showAnimation: {
            type: 'popIn',
            duration: 250,
            easing: 'ease-out'
        },
        hideAnimation: {
            type: 'popOut',
            duration: 250,
            easing: 'ease-out'
        },
    },


    constructor: function() {
        this.callParent(arguments);
        this.retryQueue = [];
    },

    initialize: function() {
        var me = this;

        me.callParent(arguments);

        me.loginBtn = me.down('#loginBtn').on('tap', 'onLoginTap', me);
        me.retryBtn = me.down('#retryBtn').on('tap', 'onRetryTap', me);
        me.cancelBtn = me.down('#cancelBtn').on('tap', 'onCancelTap', me);
    },

    show: function(options) {
        var me = this;

        if (options) {
            if (options.loginUrl) {
                me.setLoginUrl(options.loginUrl);
            }

            me.retryQueue.push(options);
        }

        return me.callParent();
    },

    onLoginTap: function() {
        window.open(this.getLoginUrl(), '_blank');
    },

    onRetryTap: function() {
        var queue = this.retryQueue,
            options;

        this.hide();

        while (queue.length) {
            options = queue.shift();
            options.connection.request(options.requestOptions);
        }
    },

    onCancelTap: function() {
        this.retryQueue.length = 0;
        this.hide();
    }
});