Ext.define('Jarvus.override.proxy.Abort', {
    override: 'Ext.data.proxy.Ajax',

    doRequest: function() {
        var request = this.callParent(arguments);

        this.lastAjaxRequest = Ext.Ajax.requests[Ext.data.Connection.requestId];

        return request;
    },

    abortLastRequest: function(silent) {
        var lastRequest = this.lastAjaxRequest;

        if (lastRequest) {
            lastRequest.options.silenceException = Boolean(silent);
            Ext.Ajax.abort(lastRequest);
        }
    }
});