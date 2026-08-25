/**
 * Hands server-generated files to the browser as Blob downloads via the
 * session-authenticated API.
 *
 * Successor to the retired SlateAdmin.API.downloadFile hidden-iframe +
 * downloadToken-cookie-polling hack; same pattern as the CSV export in the
 * progress print controllers.
 */
Ext.define('SlateAdmin.util.Downloads', {
    singleton: true,

    requires: [
        /* globals Slate */
        'Slate.API'
    ],

    /**
     * @param {String} url Site-relative URL of the download
     * @param {Function} [callback] Called once the download has been handed
     * to the browser (or failed — check the success argument)
     * @param {Object} [scope]
     */
    downloadFile: function(url, callback, scope) {
        fetch(Slate.API.buildUrl(url), { credentials: 'include' })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('download failed: HTTP ' + response.status);
                }

                var disposition = response.headers.get('Content-Disposition') || '',
                    filenameMatch = disposition.match(/filename="?([^";]+)"?/);

                return response.blob().then(function(blob) {
                    return {
                        blob: blob,
                        filename: filenameMatch ? filenameMatch[1] : ''
                    };
                });
            })
            .then(function(download) {
                var downloadLink = document.createElement('a'),
                    objectUrl = URL.createObjectURL(download.blob);

                downloadLink.href = objectUrl;
                downloadLink.download = download.filename;
                downloadLink.style.display = 'none';

                document.body.appendChild(downloadLink);
                downloadLink.click();

                Ext.defer(function() {
                    URL.revokeObjectURL(objectUrl);
                    downloadLink.remove();
                }, 500);

                Ext.callback(callback, scope, [true]);
            })
            .catch(function() {
                Ext.callback(callback, scope, [false]);
            });
    }
});
