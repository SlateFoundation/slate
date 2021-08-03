/* jslint browser: true, undef: true *//* global Ext,Emergence*/
Ext.define('Emergence.cms.view.composer.Multimedia', {
    extend: 'Emergence.cms.view.composer.Abstract',
    alias: 'emergence-cms-composer.multimedia',
    cls: 'multimedia-composer',
    requires: [
        'Jarvus.fileupload.UploadBox',
        'Emergence.cms.model.Media',
        'Ext.window.MessageBox'
    ],

    config: {
        media: null
    },

    inheritableStatics: {
        contentItemClass: 'Emergence\\CMS\\Item\\Media',
        buttonCfg: {
            text: 'Multimedia',
            glyph: 0xf0c6+'@FontAwesome', // fa-paperclip
            cls: 'icon-w-22',
            tooltip: 'Add an audio, video, or photo file from your computer.'
        }
    },

    previewTpl: [
        '<tpl for="Data">',
        '   <a class="media-link" title="{Caption:htmlEncode}" href="/media/{MediaID}" target="_blank">',
        '       <figure>',
        '           <img src="/thumbnail/{MediaID}/1000x1000" alt="{Caption:htmlEncode}">',
        '           <tpl if="caption">',
        '               <figcaption>{Caption:htmlEncode}</figcaption>',
        '           </tpl>',
        '       </figure>',
        '   </a>',
        '</tpl>'
    ],

    title: 'Multimedia',
    bodyPadding: '8 8 0',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: [{
        xtype: 'jarvus-uploadbox',
        connection: 'Emergence.util.API'
    }, {
        xtype: 'textfield',
        emptyText: 'Optional caption'
    }],


    // template method overrides
    initComponent: function() {
        var me = this,
            contentItem = me.getContentItem(),
            mediaData = contentItem && contentItem.Media,
            captionField, uploadBox;

        me.callParent(arguments);

        me.captionField = captionField = me.down('textfield');
        me.uploadBox = uploadBox = me.down('jarvus-uploadbox');

        if (mediaData) {
            me.setMedia(Emergence.cms.model.Media.create(mediaData));
        }

        captionField.on('change', 'firePreviewChange', me, { buffer: 50 });
        uploadBox.on('fileselect', 'onFileSelect', me);
    },

    getPreviewHtml: function(callback) {
        callback(this.lookupTpl('previewTpl').apply(this.getItemData()));
    },

    getItemData: function() {
        var me = this,
            media = me.getMedia();

        return Ext.applyIf({
            Data: media ? {
                MediaID: media.get('ID'),
                Caption: me.captionField.getValue()
            } : null
        }, me.callParent());
    },

    isEmpty: function () {
        return Ext.isEmpty(this.getMedia()) && Ext.isEmpty(this.captionField.getValue().trim());
    },


    // config handlers
    updateMedia: function(media) {
        this.uploadBox.setImageUrl('/thumbnail/'+media.get('ID')+'/1000x1000');
        this.captionField.setValue(media.get('Caption'));
    },


    // event handlers
    onFileSelect: function(uploadBox, file) {
        var me = this,
            captionField = me.captionField,
            supportedTypes = window.SiteEnvironment && window.SiteEnvironment.mediaSupportedTypes;

        // check MIME type against supported types list if available
        if (supportedTypes && !Ext.Array.contains(supportedTypes, file.type)) {
            Ext.Msg.show({
                title: 'File type not supported',
                message: 'This type of file is not currently supported. Please try another file or reach out to your technical support contact if you think this is messgae is in error.',
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });

            return;
        }

        // disable caption editing during upload because server will return a suggestion
        captionField.disable();

        // upload to server
        uploadBox.upload(file, {
            url: '/media',
            fileParam: 'mediaFile',
            success: function(response) {
                if (response.data.success) {
                    var media = Emergence.cms.model.Media.create(response.data.data);

                    me.setMedia(media);

                    captionField.setValue(media.get('Caption'));
                    captionField.enable();

                    me.firePreviewChange();
                } else {
                    Ext.Msg.alert('Failed to upload media', response.data.message || 'The file you uploaded could not be processed. Please try a different file. Details have been logged for the system administrator.');
                }
            }
        });
    }
});
