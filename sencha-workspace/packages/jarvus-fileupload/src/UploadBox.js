/*jslint browser: true, undef: true *//*global Ext,FormData*/
Ext.define('Jarvus.fileupload.UploadBox', {
    extend: 'Ext.Component',
    xtype: 'jarvus-uploadbox',
    requires: [
        'Jarvus.ext.override.data.ConnectionUploadProgress'
    ],

    config: {
        /**
         * @cfg {String/Ext.data.Connection}
         * {@link Ext.data.Connection} subclass to use for upload
         */
        connection: 'Jarvus.util.API',

        /**
         * @cfg {String/null}
         * Url of image to display as current value
         */
        imageUrl: null,

        /**
         * @cfg {Boolean}
         * False to disable built-in progress reporting
         */
        showProgress: true,

        /**
         * @cfg {Boolean}
         * False to disable built-in preview of image being uploaded
         */
        showPreview: true,

        /**
         * @cfg {Boolean}
         * True to abort an existing upload when starting a new one, currently this must be true if
         * {@link #cfg-showProgress} is set to true
         */
        abortOnUpload: true,

        /**
         * @cfg {String}
         * Current status
         */
        status: 'ready'
    },

    /**
     * @event fileselect
     * Fires when a new file has been selected for upload
     * @param {Jarvus.ext.uploadbox.UploadBox} uploadBox This component
     * @param {File} file The selected file
     * @param {Ext.event.Event} e The underlying event
     */

    /**
     * @event beforeupload
     * Fires before an upload
     * @param {Jarvus.ext.uploadbox.UploadBox} uploadBox This component
     * @param {File} file The selected file
     * @param {Object} options Options for the request
     */

    /**
     * @event uploadstart
     * Fires after an upload starts
     * @param {Jarvus.ext.uploadbox.UploadBox} uploadBox This component
     * @param {Object} request The request object. This may be used to cancel the request.
     * @param {File} file The selected file
     * @param {Object} options Options for the request
     */

    /**
     * @event uploadprogress
     * Fires after an upload starts
     * @param {Jarvus.ext.uploadbox.UploadBox} uploadBox This component
     * @param {Ext.event.Event} e The underlying event
     * @param {Object} request The request object. This may be used to cancel the request.
     * @param {File} file The selected file
     * @param {Object} options Options for the request
     */

    /**
     * @event uploadsuccess
     * Fires after an upload starts
     * @param {Jarvus.ext.uploadbox.UploadBox} uploadBox This component
     * @param {Object} response The XMLHttpRequest object containing the response data.
     * @param {Object} request The request object. This may be used to cancel the request.
     * @param {File} file The selected file
     * @param {Object} options Options for the request
     */

    componentCls: 'jarvus-uploadbox',

    autoEl: {
        tag: 'form',
        method: 'POST',
        enctype: 'multipart/form-data'
    },
    childEls: [
        'fileInputEl',
        'imgEl',
        'progressEl',
        'placeholderCt'
    ],
    renderTpl: [
        '<input type="file" id="{id}-fileInputEl" data-ref="fileInputEl">',
        '<img id="{id}-imgEl" data-ref="imgEl" style="display:none">',
        '<div id="{id}-progressEl" data-ref="progressEl" class="progress" style="display:none"></div>',
        '<div class="placeholder" id="{id}-placeholderCt" data-ref="placeholderCt">Click to browse or drop media file</div>'
    ],

    // config handlers
    applyConnection: function(connection) {
        if (typeof connection == 'string') {
            Ext.syncRequire(connection);
            connection = Ext.ClassManager.get(connection);
        }

        return connection;
    },

    updateImageUrl: function(imageUrl) {
        var me = this,
            imgEl = me.imgEl,
            placeholderCt = me.placeholderCt;

        if (me.rendered) {
            if (imageUrl) {
                imgEl.on('load', function() {
                   me.updateLayout();
                }, me, { single: true });

                placeholderCt.hide();
                imgEl.set({src: imageUrl}).show();
            } else {
                imgEl.hide();
                placeholderCt.show();
                me.updateLayout();
            }

        }
    },

    updateStatus: function(newStatus, oldStatus) {
        if (oldStatus) {
            this.removeCls('uploadbox-' + oldStatus);
        }

        if (newStatus) {
            this.addCls('uploadbox-' + newStatus);
        }
    },

    // event handlers
    onRender: function() {
        var me = this,
            imageUrl = me.getImageUrl(),
            placeholderCt;

        me.callParent();

        me.mon(me.fileInputEl, 'change', 'onFileChange', me);
        me.mon(me.el, {
            scope: me,
            dragover: 'onDragOver',
            dragleave: 'onDragLeave',
            drop: 'onDrop'
        });

        placeholderCt = me.placeholderCt.setVisibilityMode(Ext.Element.DISPLAY);

        if (imageUrl) {
            me.imgEl.set({src: imageUrl}).show();
            placeholderCt.hide();
        }
    },

    onFileChange: function(ev, t) {
        var me = this;

        me.fireEvent('fileselect', me, t.files[0], ev);
    },

    onDragOver: function(ev, t) {
        ev.stopEvent();
        ev.browserEvent.dataTransfer.dropEffect = 'copy';
        this.el.addCls('file-drag-over');
    },

    onDragLeave: function(ev, t) {
        this.el.removeCls('file-drag-over');
    },

    onDrop: function(ev, t) {
        var me = this;

        ev.stopEvent();
        me.el.removeCls('file-drag-over');

        me.fireEvent('fileselect', me, ev.browserEvent.dataTransfer.files[0], ev);
    },


    // public methods

    /**
     * Load preview of given file
     * @param {File} file The file to preview
     */
    loadPreview: function(file) {
        var me = this,
            reader = new FileReader();

        reader.onload = function(ev) {
            me.setImageUrl(ev.target.result);
        };

        reader.readAsDataURL(file);
    },

    /**
     * Uploades given file to the server
     *
     * @param {File} file The file object
     * @param {Object} [options] The request options
     *
     * @param {String} [options.fileParam="file"] Field name to use for uploading the file
     *
     * @param {Object} [options.params] Additional form parameters to include with the upload
     *
     * @param {Function} options.success The function to be called upon success of the request.
     * @param {Object} options.success.response The XMLHttpRequest object containing the response data.
     * @param {File} options.success.file The uploaded file
     * @param {Object} options.success.options The parameter to the request call.
     *
     * @return {Object} The request object. This may be used to cancel the request.
     */
    upload: function(file, options) {
        var me = this,
            connection = me.getConnection(),
            showProgress = me.getShowProgress(),
            lastRequest = me.lastRequest,
            progressEl = me.progressEl,
            success = options.success,
            params = options.params || {},
            form = new FormData(),
            name;

        if (false === me.fireEvent('beforeupload', me, file, options)) {
            return;
        }

        // build form
        form.append(options.fileParam || 'file', file);

        // transfer params to form
        for (name in params) {
            if (params.hasOwnProperty(name)) {
                form.append(name, params[name]);
            }
        }

        // reset progress indicator
        if (showProgress) {
            progressEl.setWidth(0).show();
        }

        // show preview
        if (me.getShowPreview() && file.type.match('^image/(gif|jpeg|png|tiff)$')) {
            me.loadPreview(file);
        }

        // abort last request
        if (me.getAbortOnUpload() && lastRequest) {
            connection.abort(lastRequest);
        }

        // update status
        me.setStatus('uploading');

        lastRequest = me.lastRequest = connection.request(Ext.applyIf({
            method: 'POST',
            headers: Ext.applyIf({
                'Content-Type': null // explicitely set to null so sencha won't auto-set it, it needs to be null so that FormData will populate it with needed multipart boundary
            }, options.headers),
            params: null,
            rawData: form,
            timeout: options.timeout || 7200000, // 2 hours
            uploadProgress: function(ev) {
                if (showProgress) {
                    progressEl.setWidth((ev.loaded / ev.total * 100) + '%');
                }

                me.fireEvent('uploadprogress', me, ev, lastRequest, file, options);
            },
            success: function(response) {
                if (showProgress) {
                    progressEl.hide().setWidth(0);
                }

                me.setStatus('ready');

                me.fireEvent('uploadsuccess', me, response, lastRequest, file, options);
                Ext.callback(success, options.scope || me, [response, file, options]);
            }
        }, options));

        me.fireEvent('uploadstart', me, lastRequest, file, options);

        return lastRequest;
    }
});
