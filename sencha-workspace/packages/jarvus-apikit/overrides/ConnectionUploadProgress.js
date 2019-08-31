Ext.define('Jarvus.ext.override.data.ConnectionUploadProgress', {
    override: 'Ext.data.Connection',

    newRequest: function(options) {
        var xhr = this.callParent([options]);

        if (options.uploadProgress) {
            xhr.upload.onprogress = options.uploadProgress;
        }

        return xhr;
    }
});